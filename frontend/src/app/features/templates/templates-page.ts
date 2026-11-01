import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteNav } from '../../shared/site-nav';
import { SiteFooter } from '../../shared/site-footer';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, TemplateTag } from '../../core/cv/templates';
import { UiLanguage } from '../../core/i18n/ui-language';

@Component({
  selector: 'app-templates-page',
  imports: [TranslatePipe, SiteNav, SiteFooter, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-site-nav />
    <div class="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <h1 class="serif text-balance text-[2.75rem] leading-tight">{{ 'templates.title' | translate }}</h1>
      <p class="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{{ 'templates.subtitle' | translate }}</p>
      <div class="mt-10 flex flex-wrap gap-6 border-b border-line text-[14px]" role="tablist">
        @for (f of filters; track f) {
          <button type="button" role="tab" [attr.aria-selected]="filter() === f" class="-mb-px border-b pb-3 transition" [class]="filter() === f ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'" (click)="filter.set(f)">
            {{ 'templates.filter.' + f | translate }}
          </button>
        }
      </div>
    </div>
    <div class="mx-auto grid max-w-6xl gap-x-6 gap-y-12 px-5 pt-10 pb-28 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
      @for (t of visible(); track t.id) {
        <button type="button" class="group text-left" (click)="use(t.id)">
          <div class="flex justify-center rounded-xl bg-paper-2 px-8 pt-8 transition group-hover:bg-[#ebe9e3]">
            <div class="overflow-hidden rounded-t-md bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05),0_16px_40px_-18px_rgb(0_0_0/0.2)] transition group-hover:-translate-y-1">
              <cv-thumb [templateId]="t.id" [lang]="ui.current()" [width]="280" class="h-[330px]!" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between gap-3">
            <div>
              <p class="text-[15px] font-medium text-ink">{{ t.name }}</p>
              <p class="mt-0.5 text-[13px] text-muted">{{ 'layout.columns.' + t.columns | translate }} · {{ 'templates.filter.' + t.tags[0] | translate }}{{ t.ats ? ' · ATS' : '' }}</p>
            </div>
            <span class="text-[13px] font-medium text-ink opacity-0 transition group-hover:opacity-100">{{ 'templates.use' | translate }} →</span>
          </div>
        </button>
      }
    </div>
    <app-site-footer />
  `,
})
export class TemplatesPage {
  protected readonly ui = inject(UiLanguage);
  private readonly router = inject(Router);
  protected readonly filters: ('all' | TemplateTag)[] = ['all', 'ats', 'modern', 'classic', 'creative', 'minimal'];
  protected readonly filter = signal<'all' | TemplateTag>(
    (['ats', 'modern', 'classic', 'creative', 'minimal'].includes(inject(ActivatedRoute).snapshot.queryParamMap.get('f') ?? '')
      ? inject(ActivatedRoute).snapshot.queryParamMap.get('f')
      : 'all') as 'all' | TemplateTag,
  );
  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(f));
  });

  protected use(id: string): void {
    this.router.navigate(['/start'], { queryParams: { template: id } });
  }
}
