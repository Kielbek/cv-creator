import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Check, ShieldCheck } from 'lucide-angular';
import { CvStore } from '../../../core/cv/cv.store';
import { TEMPLATES } from '../../../core/cv/templates';
import { FontId, PageSize } from '../../../core/cv/cv.model';
import { CvThumb } from '../../../cv-render/cv-thumb';

@Component({
  selector: 'app-design-panel',
  imports: [TranslatePipe, LucideAngularModule, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = store.cv();
    @let g = store.geometry();
    <div class="space-y-5">
      <div class="panel-card p-4">
        <h3 class="mb-3 text-sm font-semibold text-slate-800">{{ 'design.template' | translate }}</h3>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          @for (t of templates; track t.id) {
            <button type="button" class="group text-left" (click)="store.setTemplate(t.id)" [attr.aria-pressed]="c.design.templateId === t.id">
              <div class="relative overflow-hidden rounded-lg border-2 transition" [class]="c.design.templateId === t.id ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200 group-hover:border-brand-300'">
                <cv-thumb [templateId]="t.id" [cv]="c" [width]="132" class="mx-auto" />
                @if (c.design.templateId === t.id) {
                  <span class="absolute right-1.5 top-1.5 rounded-full bg-brand-500 p-0.5 text-white"><lucide-icon [img]="icons.Check" class="size-3.5" /></span>
                }
              </div>
              <div class="mt-1.5 flex items-center justify-between gap-1 text-xs">
                <span class="font-medium text-slate-700">{{ t.name }}</span>
                @if (t.ats) {
                  <span class="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"><lucide-icon [img]="icons.ShieldCheck" class="size-3" />ATS</span>
                }
              </div>
            </button>
          }
        </div>
      </div>

      <div class="panel-card space-y-4 p-4">
        <div>
          <h3 class="mb-2 text-sm font-semibold text-slate-800">{{ 'design.accent' | translate }}</h3>
          <div class="flex flex-wrap items-center gap-2">
            @for (color of swatches; track color) {
              <button
                type="button"
                class="size-8 rounded-full ring-offset-2 transition"
                [style.background]="color"
                [class.ring-2]="g.accent === color"
                [class.ring-brand-500]="g.accent === color"
                (click)="setAccent(color)"
                [attr.aria-label]="color"
              ></button>
            }
            <label class="relative size-8 cursor-pointer overflow-hidden rounded-full border border-slate-200 bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" [title]="'design.custom' | translate">
              <input type="color" class="absolute inset-0 cursor-pointer opacity-0" [value]="g.accent" (input)="setAccent($any($event.target).value)" />
            </label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="font">{{ 'design.font' | translate }}</label>
            <select id="font" class="input" [value]="g.font" (change)="setFont($any($event.target).value)">
              @for (f of fonts; track f.id) {
                <option [value]="f.id" [selected]="f.id == g.font">{{ f.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="ps">{{ 'design.pageSize' | translate }}</label>
            <select id="ps" class="input" [value]="c.design.pageSize" (change)="setPage($any($event.target).value)">
              <option value="A4" [selected]="'A4' == c.design.pageSize">A4</option>
              <option value="LETTER" [selected]="'LETTER' == c.design.pageSize">US Letter</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label flex justify-between" for="fs"><span>{{ 'design.fontSize' | translate }}</span><span>{{ scalePct() }}%</span></label>
          <input id="fs" type="range" min="0.85" max="1.15" step="0.01" class="w-full accent-brand-500" [value]="c.design.fontScale" (input)="setScale(+$any($event.target).value)" />
          <p class="text-xs text-slate-400">{{ 'design.fontSizeHint' | translate }}</p>
        </div>
      </div>
    </div>
  `,
})
export class DesignPanel {
  protected readonly store = inject(CvStore);
  protected readonly templates = TEMPLATES;
  protected readonly icons = { Check, ShieldCheck };
  protected readonly swatches = ['#5b4cf5', '#2f54eb', '#0e7490', '#0f766e', '#15803d', '#b45309', '#e8590c', '#be123c', '#a21caf', '#1e3a5f', '#111827'];
  protected readonly fonts: { id: FontId; name: string }[] = [
    { id: 'inter', name: 'Inter' },
    { id: 'system', name: 'System Sans' },
    { id: 'lora', name: 'Lora (serif)' },
    { id: 'georgia', name: 'Georgia (serif)' },
  ];
  protected readonly scalePct = computed(() => Math.round(this.store.cv().design.fontScale * 100));

  protected setAccent(color: string): void {
    this.store.update((cv) => (cv.design.accent = color));
  }

  protected setFont(font: FontId): void {
    this.store.update((cv) => (cv.design.font = font));
  }

  protected setPage(size: PageSize): void {
    this.store.update((cv) => (cv.design.pageSize = size));
  }

  protected setScale(v: number): void {
    this.store.update((cv) => (cv.design.fontScale = v));
  }
}
