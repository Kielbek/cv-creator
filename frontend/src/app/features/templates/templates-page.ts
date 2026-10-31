import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ShieldCheck, ArrowRight } from 'lucide-angular';
import { SiteNav } from '../../shared/site-nav';
import { SiteFooter } from '../../shared/site-footer';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, TemplateTag } from '../../core/cv/templates';
import { CvStore } from '../../core/cv/cv.store';
import { UiLanguage } from '../../core/i18n/ui-language';

@Component({
  selector: 'app-templates-page',
  imports: [TranslatePipe, LucideAngularModule, SiteNav, SiteFooter, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero-bg pb-16 text-white">
      <app-site-nav />
      <div class="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">{{ 'templates.title' | translate }}</h1>
        <p class="mt-3 max-w-2xl text-white/70">{{ 'templates.subtitle' | translate }}</p>
        <div class="mt-8 flex flex-wrap gap-2">
          @for (f of filters; track f) {
            <button type="button" class="rounded-full px-4 py-1.5 text-sm font-medium transition" [class]="filter() === f ? 'bg-white text-slate-900' : 'bg-white/10 text-white/80 hover:bg-white/20'" (click)="filter.set(f)">
              {{ 'templates.filter.' + f | translate }}
            </button>
          }
        </div>
      </div>
    </div>
    <div class="mx-auto -mt-8 grid max-w-7xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      @for (t of visible(); track t.id) {
        <div class="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl hover:ring-brand-300">
          <div class="relative flex justify-center overflow-hidden bg-slate-100 p-4">
            <cv-thumb [templateId]="t.id" [lang]="ui.current()" [width]="250" class="shadow-md" />
            <div class="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink-950/70 to-transparent p-5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" class="btn-primary text-sm" (click)="use(t.id)">{{ 'templates.use' | translate }} <lucide-icon [img]="icons.ArrowRight" class="size-4" /></button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-900">{{ t.name }}</p>
              <p class="text-xs text-slate-500">{{ 'layout.columns.' + t.columns | translate }} · {{ 'templates.filter.' + t.tags[0] | translate }}</p>
            </div>
            @if (t.ats) {
              <span class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><lucide-icon [img]="icons.ShieldCheck" class="size-3.5" /> ATS</span>
            }
          </div>
          <button type="button" class="sr-only" (click)="use(t.id)">{{ 'templates.use' | translate }} {{ t.name }}</button>
        </div>
      }
    </div>
    <app-site-footer />
  `,
})
export class TemplatesPage {
  protected readonly ui = inject(UiLanguage);
  private readonly store = inject(CvStore);
  private readonly router = inject(Router);
  protected readonly icons = { ShieldCheck, ArrowRight };
  protected readonly filters: ('all' | TemplateTag)[] = ['all', 'ats', 'modern', 'classic', 'creative', 'minimal'];
  protected readonly filter = signal<'all' | TemplateTag>('all');
  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(f));
  });

  protected use(id: string): void {
    this.store.setTemplate(id);
    this.router.navigateByUrl('/editor');
  }
}
