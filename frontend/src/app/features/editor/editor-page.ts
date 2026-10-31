import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  LucideAngularModule,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Download,
  Eye,
  FileJson,
  FileUp,
  LayoutGrid,
  Lightbulb,
  MoreHorizontal,
  Palette,
  RotateCcw,
  Sparkles,
  Undo2,
  CircleCheck,
  Circle,
  X,
} from 'lucide-angular';
import { CvStore, migrate } from '../../core/cv/cv.store';
import { CvDocument } from '../../cv-render/cv-document';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';
import { COUNTRIES } from '../../core/cv/countries';
import { sampleCv } from '../../core/cv/sample';
import { UiLanguage } from '../../core/i18n/ui-language';
import { ContentPanel } from './panels/content-panel';
import { LayoutPanel } from './panels/layout-panel';
import { DesignPanel } from './panels/design-panel';
import { AiPanel } from './panels/ai-panel';
import { Toasts, ToastsHost } from '../../shared/toasts';
import { LanguageSwitcher } from '../../shared/language-switcher';
import { Logo } from '../../shared/logo';
import { checks, score } from './completeness';
import { STEPS } from './steps';

type FinishTab = 'design' | 'layout' | 'ai';
const STEP_KEY = 'cv-creator:step';

/**
 * Step-by-step editor: dark step rail on the left, the form of the current step in the middle, the live,
 * paginated preview on the right. Steps can be visited in any order; "Finish" holds design, layout, AI and download.
 */
@Component({
  selector: 'app-editor-page',
  imports: [TranslatePipe, LucideAngularModule, RouterLink, CvDocument, ContentPanel, LayoutPanel, DesignPanel, AiPanel, ToastsHost, LanguageSwitcher, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.css',
})
export class EditorPage {
  protected readonly store = inject(CvStore);
  private readonly toasts = inject(Toasts);
  private readonly ui = inject(UiLanguage);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  protected readonly icons = { ArrowLeft, ArrowRight, Check, ChevronLeft, Download, Eye, FileJson, FileUp, LayoutGrid, Lightbulb, MoreHorizontal, Palette, RotateCcw, Sparkles, Undo2, CircleCheck, Circle, X };

  protected readonly cv = this.store.cv;
  protected readonly steps = STEPS;
  protected readonly stepIndex = signal(readStep());
  protected readonly step = computed(() => STEPS[this.stepIndex()]);
  protected readonly isFinish = computed(() => this.step().id === 'finish');
  protected readonly finishTab = signal<FinishTab>('design');
  protected readonly railCollapsed = signal(false);
  protected readonly mobilePreview = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly pageCount = signal(1);

  protected readonly languages = CV_LANGUAGES;
  protected readonly countries = COUNTRIES;
  protected readonly checklist = computed(() => checks(this.cv()));
  protected readonly score = computed(() => score(this.checklist()));

  /** preview scaled to the width of its column */
  private readonly previewBox = viewChild<ElementRef<HTMLElement>>('previewBox');
  private readonly previewWidth = signal(420);
  protected readonly previewZoom = computed(() => Math.min(1, Math.max(0.3, (this.previewWidth() - 8) / 794)));

  constructor() {
    const observer = new ResizeObserver((entries) => this.previewWidth.set(entries[0].contentRect.width));
    afterNextRender(() => {
      const el = this.previewBox()?.nativeElement;
      if (el) observer.observe(el);
    });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  protected go(i: number): void {
    const next = Math.max(0, Math.min(STEPS.length - 1, i));
    this.stepIndex.set(next);
    try {
      sessionStorage.setItem(STEP_KEY, String(next));
    } catch {
      /* ignore */
    }
    this.document.querySelector('.wizard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** a step is "done" when its sections have content (just a visual hint) */
  protected done(i: number): boolean {
    const c = this.cv();
    switch (STEPS[i].id) {
      case 'header':
        return !!(c.personal.firstName && c.personal.lastName && c.personal.email);
      case 'experience':
        return c.experience.length > 0;
      case 'education':
        return c.education.length > 0;
      case 'skills':
        return c.skills.length > 0;
      case 'languages':
        return c.languages.length > 0;
      case 'summary':
        return !!c.summary.trim();
      case 'extra':
        return c.projects.length + c.certificates.length > 0 || !!c.interests.trim();
      default:
        return false;
    }
  }

  protected langName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'language' }).of(code) ?? code;
  }

  protected countryName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'region' }).of(code) ?? code;
  }

  protected setLanguage(code: string): void {
    this.store.update((cv) => (cv.language = code), true);
  }

  protected setCountry(code: string): void {
    this.store.setCountry(code, false);
  }

  /** Browser print → "Save as PDF": vector text (ATS-readable), exact page size, no server round-trip. */
  protected download(): void {
    const cv = this.cv();
    const title = this.document.title;
    const name = [cv.personal.firstName, cv.personal.lastName].filter(Boolean).join('_') || 'CV';
    const style = this.document.createElement('style');
    style.textContent = `@page { size: ${cv.design.pageSize === 'LETTER' ? 'letter' : 'A4'}; margin: 0; }`;
    this.document.head.appendChild(style);
    this.document.title = `CV_${name}`;
    const restore = () => {
      this.document.title = title;
      style.remove();
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(() => window.print(), 50);
  }

  protected exportJson(): void {
    const blob = new Blob([JSON.stringify(this.cv(), null, 2)], { type: 'application/json' });
    const a = this.document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cv-${(this.cv().personal.lastName || 'data').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    this.menuOpen.set(false);
  }

  protected async importJson(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    this.menuOpen.set(false);
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (typeof data !== 'object' || !data.personal) throw new Error('not a CV');
      this.store.replace(migrate(data));
      this.toasts.show('editor.menu.imported');
    } catch {
      this.toasts.show('editor.menu.importError', 'error');
    }
  }

  protected loadSample(): void {
    const sample = sampleCv(this.ui.current(), this.cv().design.templateId);
    sample.design = { ...this.cv().design };
    this.store.replace(sample);
    this.menuOpen.set(false);
  }

  protected reset(): void {
    this.menuOpen.set(false);
    if (!confirm(this.translate.instant('editor.menu.resetConfirm'))) return;
    const cv = this.cv();
    this.store.reset(cv.language, cv.country);
    this.go(0);
    this.toasts.show('editor.menu.resetDone');
  }
}

function readStep(): number {
  try {
    const n = Number(sessionStorage.getItem(STEP_KEY));
    return Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0;
  } catch {
    return 0;
  }
}
