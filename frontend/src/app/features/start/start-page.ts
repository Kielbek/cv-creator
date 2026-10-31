import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowLeft, Check, FilePlus2, FileUp, FilePen, Upload, X } from 'lucide-angular';
import { Logo } from '../../shared/logo';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, TemplateTag, findTemplate } from '../../core/cv/templates';
import { CvStore } from '../../core/cv/cv.store';
import { emptyCv, sampleCv } from '../../core/cv/sample';
import { AiError, AiService } from '../../core/ai/ai.service';
import { applyImported } from '../../core/cv/import';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';
import { UiLanguage } from '../../core/i18n/ui-language';
import { Toasts, ToastsHost } from '../../shared/toasts';
import { hasContent } from '../../core/cv/cv.model';

type Stage = 'template' | 'method' | 'upload' | 'loading';
type Method = 'new' | 'import' | 'continue';

/**
 * Onboarding before the editor: pick a template (and colour) → start fresh, import an existing CV (AI) or continue
 * the CV saved in this browser → short preparation screen → editor.
 */
@Component({
  selector: 'app-start-page',
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, LucideAngularModule, Logo, CvThumb, ToastsHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './start-page.html',
})
export class StartPage {
  private readonly store = inject(CvStore);
  private readonly ai = inject(AiService);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  protected readonly ui = inject(UiLanguage);
  protected readonly icons = { ArrowLeft, Check, FilePlus2, FileUp, FilePen, Upload, X };

  protected readonly stage = signal<Stage>('template');
  protected readonly templateId = signal(this.store.cv().design.templateId);
  protected readonly accent = signal<string | null>(null);
  protected readonly method = signal<Method>('new');
  protected readonly filter = signal<'all' | TemplateTag>('all');
  protected readonly file = signal<File | null>(null);
  protected readonly pasted = signal('');
  protected readonly pasteMode = signal(false);
  protected readonly dragging = signal(false);
  protected readonly progress = signal(0);
  protected readonly doneItems = signal(0);

  protected readonly filters: ('all' | TemplateTag)[] = ['all', 'ats', 'modern', 'classic', 'creative', 'minimal'];
  protected readonly swatches: (string | null)[] = [null, '#1b1b19', '#23406b', '#3f5874', '#2c5e5a', '#4d5b3a', '#8a6a3b', '#a4502e', '#8c3b45', '#5a4a6e'];
  protected readonly templates = computed(() => {
    const f = this.filter();
    return f === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(f));
  });
  protected readonly template = computed(() => findTemplate(this.templateId()));
  protected readonly hasSaved = computed(() => {
    const cv = this.store.cv();
    return !!(cv.personal.firstName || cv.personal.lastName) || hasContent(cv, 'experience') || hasContent(cv, 'summary');
  });
  protected readonly loadingSteps = computed(() =>
    this.method() === 'import' ? ['read', 'structure', 'template', 'preview'] : ['template', 'country', 'ai', 'preview'],
  );

  private timers: ReturnType<typeof setInterval>[] = [];

  constructor() {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    const t = q.get('template');
    if (t && TEMPLATES.some((x) => x.id === t)) {
      this.templateId.set(t);
      this.stage.set('method');
    }
    if (this.hasSaved()) this.method.set('continue');
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearInterval));
  }

  protected pick(id: string): void {
    this.templateId.set(id);
    this.stage.set('method');
    window.scrollTo({ top: 0 });
  }

  protected next(): void {
    if (this.method() === 'import') {
      this.stage.set('upload');
      return;
    }
    this.finish();
  }

  protected back(): void {
    this.stage.set(this.stage() === 'upload' ? 'method' : 'template');
  }

  // ---- upload ------------------------------------------------------------------------------------------------------

  protected onFile(e: Event): void {
    this.setFile((e.target as HTMLInputElement).files?.[0] ?? null);
    (e.target as HTMLInputElement).value = '';
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    this.setFile(e.dataTransfer?.files?.[0] ?? null);
  }

  private setFile(f: File | null): void {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return this.toasts.show('start.upload.onlyPdf', 'warn');
    if (f.size > 5 * 1024 * 1024) return this.toasts.show('start.upload.tooBig', 'warn');
    this.file.set(f);
  }

  protected canImport(): boolean {
    return this.pasteMode() ? this.pasted().trim().length >= 80 : !!this.file();
  }

  protected async runImport(): Promise<void> {
    if (!this.ai.enabled()) return this.toasts.show('ai.disabled', 'warn');
    this.startLoading(false);
    try {
      const data = this.pasteMode() ? await this.ai.importText(this.pasted()) : await this.ai.importPdf(this.file()!);
      const current = this.store.cv();
      const cv = emptyCv(current.language, current.country);
      applyImported(cv, data, CV_LANGUAGES);
      this.applyDesign(cv);
      this.store.replace(cv);
      this.completeLoading();
    } catch (e) {
      this.timers.forEach(clearInterval);
      this.stage.set('upload');
      this.toasts.show(`ai.error.${e instanceof AiError ? e.code : 'ai_unavailable'}`, 'error');
    }
  }

  // ---- finish ------------------------------------------------------------------------------------------------------

  private finish(): void {
    if (this.method() === 'continue') {
      this.store.setTemplate(this.templateId());
      if (this.accent()) this.store.update((cv) => (cv.design.accent = this.accent()));
    } else {
      const current = this.store.cv();
      const cv = emptyCv(current.language, current.country);
      this.applyDesign(cv);
      this.store.replace(cv);
    }
    this.startLoading(true);
  }

  private applyDesign(cv: ReturnType<typeof emptyCv>): void {
    const fresh = sampleCv('en', this.templateId());
    cv.design = { ...fresh.design, pageSize: cv.design.pageSize, accent: this.accent() };
  }

  /** short preparation screen; for an import it waits for the AI and completes in completeLoading() */
  private startLoading(autoComplete: boolean): void {
    this.stage.set('loading');
    this.progress.set(4);
    this.doneItems.set(0);
    const total = autoComplete ? 1400 : 25000;
    const started = Date.now();
    const t = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - started) / total);
      const eased = autoComplete ? ratio : 1 - Math.pow(1 - ratio, 3);
      this.progress.set(Math.round(4 + eased * (autoComplete ? 96 : 86)));
      this.doneItems.set(Math.min(this.loadingSteps().length - (autoComplete ? 0 : 1), Math.floor(eased * this.loadingSteps().length + 0.2)));
      if (autoComplete && ratio >= 1) this.completeLoading();
    }, 80);
    this.timers.push(t);
  }

  private completeLoading(): void {
    this.timers.forEach(clearInterval);
    this.progress.set(100);
    this.doneItems.set(this.loadingSteps().length);
    try {
      sessionStorage.setItem('cv-creator:step', '0');
    } catch {
      /* ignore */
    }
    setTimeout(() => this.router.navigateByUrl('/editor'), 350);
  }
}
