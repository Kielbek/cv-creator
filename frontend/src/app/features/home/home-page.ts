import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowRight, Plus, ShieldCheck } from 'lucide-angular';
import { SiteNav } from '../../shared/site-nav';
import { SiteFooter } from '../../shared/site-footer';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, findTemplate } from '../../core/cv/templates';
import { UiLanguage } from '../../core/i18n/ui-language';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, SiteNav, SiteFooter, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly ui = inject(UiLanguage);
  protected readonly icons = { ArrowRight, Plus, ShieldCheck };
  protected readonly templateCount = TEMPLATES.length;
  protected readonly cvLanguageCount = CV_LANGUAGES.length;
  protected readonly showcase = ['atlas', 'nova', 'executive', 'onyx'].map(findTemplate);
  protected readonly features = ['ai', 'ats', 'languages', 'layout', 'tailor', 'privacy'];
  protected readonly faq = ['free', 'ats', 'data', 'ai', 'pages', 'languages'];
}
