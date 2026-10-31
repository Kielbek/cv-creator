import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, GripVertical, Plus, X } from 'lucide-angular';
import { CvStore } from '../../../core/cv/cv.store';
import { ALL_SECTIONS, SectionId, hasContent } from '../../../core/cv/cv.model';

/**
 * Free arrangement within the template's columns: drag sections between columns or into "not shown".
 * Pagination follows automatically.
 */
@Component({
  selector: 'app-layout-panel',
  imports: [TranslatePipe, LucideAngularModule, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <p class="text-[13.5px] leading-relaxed text-muted">{{ 'layout.arrangeHint' | translate }}</p>

      <!-- page schematic -->
      <div class="mt-6 rounded-lg border border-line bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)]" cdkDropListGroup>
        @if (geo().header !== 'sidebar') {
          <div class="mb-3 flex h-9 items-center rounded-md bg-paper-2 px-3 text-[12px] text-faint">{{ 'layout.headerArea' | translate }}</div>
        }
        <div class="grid gap-3" [style.grid-template-columns]="gridCols()">
          @for (col of columns(); track $index; let ci = $index) {
            <div
              cdkDropList
              [cdkDropListData]="col"
              [id]="'col-' + ci"
              (cdkDropListDropped)="drop($event, ci)"
              class="min-h-40 space-y-1.5 rounded-md bg-paper-2 p-1.5"
            >
              @if (geo().header === 'sidebar' && ci === geo().sidebarIndex) {
                <div class="flex h-9 items-center rounded px-2 text-[12px] text-faint">{{ 'layout.headerArea' | translate }}</div>
              }
              @for (s of col; track s) {
                <div cdkDrag [cdkDragData]="s" class="layout-row group" [class.is-empty]="!filled(s)">
                  <lucide-icon cdkDragHandle [img]="icons.GripVertical" class="size-3.5 shrink-0 cursor-grab text-faint" />
                  <span class="min-w-0 flex-1 truncate">{{ 'editor.sections.' + s | translate }}</span>
                  <button type="button" class="layout-row-x" (click)="hide(s)" [attr.aria-label]="'layout.hide' | translate"><lucide-icon [img]="icons.X" class="size-3.5" /></button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="mt-8">
        <p class="text-[13px] font-medium text-ink">{{ 'layout.hidden' | translate }}</p>
        <div cdkDropList [cdkDropListData]="unused()" id="unused" (cdkDropListDropped)="drop($event, -1)" class="mt-3 flex min-h-10 flex-wrap gap-2">
          @for (s of unused(); track s) {
            <button type="button" cdkDrag [cdkDragData]="s" class="chip h-8! text-[13px]!" (click)="show(s)">
              <lucide-icon [img]="icons.Plus" class="size-3.5" /> {{ 'editor.sections.' + s | translate }}
            </button>
          } @empty {
            <span class="text-[13px] text-faint">{{ 'layout.allShown' | translate }}</span>
          }
        </div>
        @if (unused().includes('contact')) {
          <p class="hint">{{ 'layout.contactInHeader' | translate }}</p>
        }
      </div>
    </div>
  `,
})
export class LayoutPanel {
  protected readonly store = inject(CvStore);
  protected readonly icons = { GripVertical, Plus, X };
  protected readonly geo = this.store.geometry;
  protected readonly columns = computed(() => this.store.cv().design.layout.map((c) => [...c]));
  protected readonly unused = computed(() => {
    const placed = new Set(this.store.cv().design.layout.flat());
    return ALL_SECTIONS.filter((s) => !placed.has(s));
  });
  protected readonly gridCols = computed(() => this.geo().widths.map((w) => `minmax(0, ${Math.max(w, 0.3)}fr)`).join(' '));


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
