import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideAngularModule,
  ArrowRight,
  BadgeCheck,
  CheckCheck,
  Columns3,
  FileDown,
  Globe2,
  Languages,
  LayoutTemplate,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-angular';
import { SiteNav } from '../../shared/site-nav';
import { SiteFooter } from '../../shared/site-footer';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES } from '../../core/cv/templates';
import { UI_LANGUAGES, UiLanguage } from '../../core/i18n/ui-language';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, SiteNav, SiteFooter, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly ui = inject(UiLanguage);
  protected readonly icons = { ArrowRight, BadgeCheck, CheckCheck, Columns3, FileDown, Globe2, Languages, LayoutTemplate, Lock, Rocket, ShieldCheck, Sparkles, Target, Zap };
  protected readonly templateCount = TEMPLATES.length;
  protected readonly cvLanguageCount = CV_LANGUAGES.length;
  protected readonly showcase = ['nova', 'onyx', 'atlas', 'executive'];
  protected readonly uiLanguages = UI_LANGUAGES;

  protected readonly features = [
    { key: 'ai', icon: Sparkles },
    { key: 'ats', icon: ShieldCheck },
    { key: 'languages', icon: Globe2 },
    { key: 'layout', icon: Columns3 },
    { key: 'tailor', icon: Target },
    { key: 'privacy', icon: Lock },
  ];
  protected readonly steps = [
    { key: 'template', icon: LayoutTemplate },
    { key: 'content', icon: Zap },
    { key: 'download', icon: FileDown },
  ];
  protected readonly faq = ['free', 'ats', 'data', 'ai', 'pages', 'languages'];
}
