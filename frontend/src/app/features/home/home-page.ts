import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowRight, Check, FileUp, Plus, ShieldCheck, Sparkles, Target, Globe2, PenLine, LayoutTemplate, Download, Columns3, Lock } from 'lucide-angular';
import { SiteNav } from '../../shared/site-nav';
import { SiteFooter } from '../../shared/site-footer';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, TemplateTag } from '../../core/cv/templates';
import { UiLanguage } from '../../core/i18n/ui-language';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';
import { COUNTRIES } from '../../core/cv/countries';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, SiteNav, SiteFooter, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mm' },
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  protected readonly ui = inject(UiLanguage);
  protected readonly icons = { ArrowRight, Check, FileUp, Plus, ShieldCheck, Sparkles, Target, Globe2, PenLine, LayoutTemplate, Download };
  protected readonly templates = TEMPLATES;

  /** a photo that fails to load leaves the neutral placeholder background instead of a broken icon */
  protected hide(e: Event): void {
    (e.target as HTMLImageElement).style.opacity = '0';
  }
  protected readonly stats = [
    { value: String(TEMPLATES.length), key: 'templates' },
    { value: String(CV_LANGUAGES.length), key: 'languages' },
    { value: String(COUNTRIES.length), key: 'countries' },
    { value: '0 €', key: 'price' },
  ];
  protected readonly steps = [
    { key: 'template', icon: LayoutTemplate },
    { key: 'content', icon: PenLine },
    { key: 'download', icon: Download },
  ];
  protected readonly flags = ['pl', 'gb', 'de', 'fr', 'es', 'it', 'nl', 'cz', 'ua', 'us', 'at', 'ch', 'ie', 'se', 'no', 'pt', 'be', 'ca'];
  protected readonly faq = ['free', 'ats', 'data', 'ai', 'pages', 'languages'];
  protected readonly features = [
    { key: 'ai', icon: Sparkles },
    { key: 'ats', icon: ShieldCheck },
    { key: 'languages', icon: Globe2 },
    { key: 'layout', icon: Columns3 },
    { key: 'tailor', icon: Target },
    { key: 'privacy', icon: Lock },
  ];
  protected readonly filters: ('all' | TemplateTag)[] = ['all', 'ats', 'modern', 'classic', 'creative'];
  protected readonly filter = signal<'all' | TemplateTag>('all');
  protected readonly shown = computed(() => {
    const f = this.filter();
    return (f === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(f))).slice(0, 4);
  });
}
