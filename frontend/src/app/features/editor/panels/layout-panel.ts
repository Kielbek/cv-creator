import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Columns2, Columns3, GripVertical, RectangleVertical, EyeOff, Eye } from 'lucide-angular';
import { CvStore } from '../../../core/cv/cv.store';
import { ALL_SECTIONS, SectionId, hasContent } from '../../../core/cv/cv.model';

/**
 * Free arrangement: pick a skeleton (1-3 columns), then drag sections between columns or into "not shown".
 * Pagination follows automatically.
 */
@Component({
  selector: 'app-layout-panel',
  imports: [TranslatePipe, LucideAngularModule, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <div class="panel-card p-4">
        <h3 class="mb-3 text-sm font-semibold text-slate-800">{{ 'layout.skeleton' | translate }}</h3>
        <div class="grid grid-cols-3 gap-2">
          @for (n of [1, 2, 3]; track n) {
            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition"
              [class]="geo().columns === n ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'"
              (click)="store.setColumns(n)"
              [attr.aria-pressed]="geo().columns === n"
            >
              <span class="flex h-12 w-10 gap-0.5 rounded border border-current p-1 opacity-80">
                @for (w of preview(n); track $index) {
                  <span class="rounded-sm bg-current opacity-40" [style.flex]="w"></span>
                }
              </span>
              {{ 'layout.columns.' + n | translate }}
            </button>
          }
        </div>
      </div>

      <div class="panel-card p-4" cdkDropListGroup>
        <h3 class="text-sm font-semibold text-slate-800">{{ 'layout.arrange' | translate }}</h3>
        <p class="mb-3 text-xs text-slate-500">{{ 'layout.arrangeHint' | translate }}</p>
        <div class="grid gap-2" [style.grid-template-columns]="gridCols()">
          @for (col of columns(); track $index; let ci = $index) {
            <div>
              <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {{ 'layout.column' | translate }} {{ ci + 1 }}
                @if (ci === geo().sidebarIndex && geo().columns > 1) {
                  · {{ 'layout.sidebar' | translate }}
                }
              </p>
              <div
                cdkDropList
                [cdkDropListData]="col"
                [id]="'col-' + ci"
                (cdkDropListDropped)="drop($event, ci)"
                class="min-h-24 space-y-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-1.5"
              >
                @for (s of col; track s) {
                  <div cdkDrag [cdkDragData]="s" class="section-chip" [class.opacity-50]="!filled(s)">
                    <lucide-icon cdkDragHandle [img]="icons.GripVertical" class="size-4 shrink-0 cursor-grab text-slate-400" />
                    <span class="min-w-0 flex-1 truncate">{{ 'editor.sections.' + s | translate }}</span>
                    <button type="button" class="text-slate-400 hover:text-slate-700" (click)="hide(s)" [attr.aria-label]="'layout.hide' | translate"><lucide-icon [img]="icons.EyeOff" class="size-3.5" /></button>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <p class="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ 'layout.hidden' | translate }}</p>
        <div cdkDropList [cdkDropListData]="unused()" id="unused" (cdkDropListDropped)="drop($event, -1)" class="flex min-h-12 flex-wrap gap-1.5 rounded-xl border-2 border-dashed border-slate-200 p-1.5">
          @for (s of unused(); track s) {
            <div cdkDrag [cdkDragData]="s" class="section-chip w-auto! cursor-grab">
              <span>{{ 'editor.sections.' + s | translate }}</span>
              <button type="button" class="text-slate-400 hover:text-brand-600" (click)="show(s)" [attr.aria-label]="'layout.show' | translate"><lucide-icon [img]="icons.Eye" class="size-3.5" /></button>
            </div>
          } @empty {
            <span class="px-2 py-1.5 text-xs text-slate-400">{{ 'layout.allShown' | translate }}</span>
          }
        </div>
        @if (unused().includes('contact')) {
          <p class="mt-2 text-xs text-slate-400">{{ 'layout.contactInHeader' | translate }}</p>
        }
      </div>
    </div>
  `,
})
export class LayoutPanel {
  protected readonly store = inject(CvStore);
  protected readonly icons = { Columns2, Columns3, GripVertical, RectangleVertical, EyeOff, Eye };
  protected readonly geo = this.store.geometry;
  protected readonly columns = computed(() => this.store.cv().design.layout.map((c) => [...c]));
  protected readonly unused = computed(() => {
    const placed = new Set(this.store.cv().design.layout.flat());
    return ALL_SECTIONS.filter((s) => !placed.has(s));
  });
  protected readonly gridCols = computed(() => this.geo().widths.map((w) => `minmax(0, ${Math.max(w, 0.3)}fr)`).join(' '));

  protected preview(n: number): number[] {
    return n === 1 ? [1] : n === 2 ? [1, 2] : [1, 1.7, 1];
  }

  protected filled(s: SectionId): boolean {
    return hasContent(this.store.cv(), s);
  }

  protected drop(e: CdkDragDrop<SectionId[]>, target: number): void {
    const layout = this.columns();
    const unused = [...this.unused()];
    const source = e.previousContainer.id === 'unused' ? -1 : Number(e.previousContainer.id.slice(4));
    const list = (i: number) => (i === -1 ? unused : layout[i]);
    if (source === target) {
      moveItemInArray(list(target), e.previousIndex, e.currentIndex);
    } else {
      transferArrayItem(list(source), list(target), e.previousIndex, e.currentIndex);
    }
    this.store.setLayout(layout);
  }

  protected hide(s: SectionId): void {
    this.store.setLayout(this.columns().map((c) => c.filter((x) => x !== s)));
  }

  protected show(s: SectionId): void {
    const layout = this.columns();
    const g = this.geo();
    const side: SectionId[] = ['contact', 'skills', 'languages', 'certificates', 'interests'];
    const target = g.columns > 1 && side.includes(s) ? g.sidebarIndex : g.mainIndex;
    if (s === 'contact') layout[target].unshift(s);
    else layout[target].push(s);
    this.store.setLayout(layout);
  }
}
