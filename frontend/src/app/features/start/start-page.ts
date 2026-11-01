import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideAngularModule,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FilePen,
  FilePlus2,
  FileText,
  FileUp,
  Lock,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-angular';
import { Logo } from '../../shared/logo';
import { CvThumb } from '../../cv-render/cv-thumb';
import { TEMPLATES, TemplateTag, findTemplate } from '../../core/cv/templates';
import { CvStore } from '../../core/cv/cv.store';
import { emptyCv, sampleCv } from '../../core/cv/sample';
import { AiError, AiService } from '../../core/ai/ai.service';
import { applyImported } from '../../core/cv/import';
import { CV_LANGUAGES } from '../../core/cv/cv-labels';
import { UiLanguage } from '../../core/i18n/ui-language';
import { hasContent } from '../../core/cv/cv.model';

type Stage = 'template' | 'method' | 'upload' | 'loading';
type Method = 'new' | 'import' | 'continue';

const MAX_BYTES = 5 * 1024 * 1024;
export const PASTE_MIN = 80;
export const PASTE_MAX = 30000;

/**
 * Onboarding before the editor: pick a template (and colour) → start fresh, import an existing CV (AI) or continue
 * the CV saved in this browser → short preparation screen → editor.
 *
 * Safety: files are checked locally (extension, size and the %PDF signature) before anything is sent; pasted text is
 * length-limited like on the server; errors are shown inline; an import can be cancelled and a late answer is ignored.
 */
@Component({
  selector: 'app-start-page',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, Logo, CvThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './start-page.html',
  styleUrl: './start-page.css',
})
export class StartPage {
  private readonly store = inject(CvStore);
  protected readonly ai = inject(AiService);
  private readonly router = inject(Router);
  protected readonly ui = inject(UiLanguage);
  protected readonly icons = {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    CircleAlert,
    FilePen,
    FilePlus2,
    FileText,
    FileUp,
    Lock,
    ShieldCheck,
    Sparkles,
    Trash2,
    Upload,
  };
  /** thumbnail render width: cards are ~170px wide in the 2-column phone grid */
  protected readonly thumbW = typeof window !== 'undefined' && window.innerWidth < 760 ? Math.floor((window.innerWidth - 46) / 2) : 260;
  protected readonly pasteMin = PASTE_MIN;
  protected readonly pasteMax = PASTE_MAX;

  protected readonly stage = signal<Stage>('template');
  /** animation direction of the last stage change */
  protected readonly dir = signal<'fwd' | 'back'>('fwd');
  protected readonly templateId = signal(this.store.cv().design.templateId);
  protected readonly accent = signal<string | null>(null);
  protected readonly method = signal<Method>('new');
  protected readonly filter = signal<'all' | TemplateTag>('all');
  protected readonly file = signal<File | null>(null);
  protected readonly checking = signal(false);
  protected readonly pasted = signal('');
  protected readonly pasteMode = signal(false);
  protected readonly dragging = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly progress = signal(0);
  protected readonly doneItems = signal(0);

  protected readonly filters: ('all' | TemplateTag)[] = ['all', 'ats', 'modern', 'classic', 'creative', 'minimal'];
  protected readonly swatches: (string | null)[] = [null, '#1b1b19', '#23406b', '#1f6bff', '#2c5e5a', '#4d5b3a', '#8a6a3b', '#a4502e', '#8c3b45', '#4b45d5'];
  protected readonly templates = computed(() => {
    const f = this.filter();
    return f === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.tags.includes(f));
  });
  protected readonly template = computed(() => findTemplate(this.templateId()));
  protected readonly hasSaved = computed(() => {
    const cv = this.store.cv();
    return !!(cv.personal.firstName || cv.personal.lastName) || hasContent(cv, 'experience') || hasContent(cv, 'summary');
  });
  protected readonly methods = computed<{ id: Method; icon: typeof FilePen }[]>(() => [
    ...(this.hasSaved() ? [{ id: 'continue' as const, icon: FilePen }] : []),
    { id: 'new', icon: FilePlus2 },
    { id: 'import', icon: FileUp },
  ]);
  protected readonly stepIndex = computed(() => ({ template: 0, method: 1, upload: 1, loading: 2 })[this.stage()]);
  protected readonly loadingSteps = computed(() =>
    this.method() === 'import' ? ['read', 'structure', 'template', 'preview'] : ['template', 'country', 'ai', 'preview'],
  );
  protected readonly pasteLength = computed(() => this.pasted().trim().length);

  private timers: ReturnType<typeof setInterval>[] = [];
  /** bumped on cancel so a late AI answer is dropped */
  private importRun = 0;

  constructor() {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    const t = q.get('template');
    if (t && TEMPLATES.some((x) => x.id === t)) {
      this.templateId.set(t);
      this.stage.set('method');
    }
    if (this.hasSaved()) this.method.set('continue');
    if (q.get('mode') === 'import') this.method.set('import');
    inject(DestroyRef).onDestroy(() => this.stopTimers());
  }

  private go(stage: Stage, dir: 'fwd' | 'back' = 'fwd'): void {
    this.dir.set(dir);
    this.error.set(null);
    this.stage.set(stage);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  protected pick(id: string): void {
    this.templateId.set(id);
    this.go('method');
  }

  protected next(): void {
    if (this.method() === 'import') return this.go('upload');
    this.finish();
  }

  protected back(): void {
    this.go(this.stage() === 'upload' ? 'method' : 'template', 'back');
  }

  /** arrow keys inside the method radiogroup */
  protected onMethodKey(e: KeyboardEvent): void {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const list = this.methods();
    const i = list.findIndex((m) => m.id === this.method());
    const nextId = list[(i + delta + list.length) % list.length].id;
    this.method.set(nextId);
    (e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-method="${nextId}"]`)?.focus();
  }

  // ---- upload ------------------------------------------------------------------------------------------------------

  protected onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    void this.setFile(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    void this.setFile(e.dataTransfer?.files?.[0] ?? null);
  }

  protected removeFile(): void {
    this.file.set(null);
    this.error.set(null);
  }

  private async setFile(f: File | null): Promise<void> {
    if (!f) return;
    this.error.set(null);
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') return this.error.set('start.upload.onlyPdf');
    if (f.size > MAX_BYTES) return this.error.set('start.upload.tooBig');
    if (f.size < 64) return this.error.set('start.upload.broken');
    this.checking.set(true);
    try {
      const head = new Uint8Array(await f.slice(0, 5).arrayBuffer());
      const isPdf = String.fromCharCode(...head) === '%PDF-';
      if (!isPdf) return this.error.set('start.upload.notRealPdf');
      this.file.set(f);
    } catch {
      this.error.set('start.upload.broken');
    } finally {
      this.checking.set(false);
    }
  }

  protected setPasted(v: string): void {
    this.pasted.set(v.slice(0, PASTE_MAX));
    this.error.set(null);
  }

  protected canImport(): boolean {
    return this.pasteMode() ? this.pasteLength() >= PASTE_MIN : !!this.file() && !this.checking();
  }

  protected async runImport(): Promise<void> {
    if (!this.canImport()) return;
    if (!this.ai.enabled()) return this.error.set('ai.disabled');
    const run = ++this.importRun;
    this.startLoading(false);
    try {
      const data = this.pasteMode() ? await this.ai.importText(this.pasted().trim()) : await this.ai.importPdf(this.file()!);
      if (run !== this.importRun) return;
      const current = this.store.cv();
      const cv = emptyCv(current.language, current.country);
      applyImported(cv, data, CV_LANGUAGES);
      this.applyDesign(cv);
      this.store.replace(cv);
      this.completeLoading();
    } catch (e) {
      if (run !== this.importRun) return;
      this.stopTimers();
      this.go('upload', 'back');
      this.error.set(`ai.error.${e instanceof AiError ? e.code : 'ai_unavailable'}`);
    }
  }

  protected cancelImport(): void {
    this.importRun++;
    this.stopTimers();
    this.go('upload', 'back');
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

  private stopTimers(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }

  /** short preparation screen; for an import it waits for the AI and completes in completeLoading() */
  private startLoading(autoComplete: boolean): void {
    this.go('loading');
    this.progress.set(4);
    this.doneItems.set(0);
    const total = autoComplete ? 2200 : 25000;
    const started = Date.now();
    const t = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - started) / total);
      const eased = autoComplete ? 1 - Math.pow(1 - ratio, 2) : 1 - Math.pow(1 - ratio, 3);
      this.progress.set(Math.round(4 + eased * (autoComplete ? 96 : 86)));
      this.doneItems.set(Math.min(this.loadingSteps().length - (autoComplete ? 0 : 1), Math.floor(eased * this.loadingSteps().length + 0.2)));
      if (autoComplete && ratio >= 1) this.completeLoading();
    }, 60);
    this.timers.push(t);
  }

  private completeLoading(): void {
    this.stopTimers();
    this.progress.set(100);
    this.doneItems.set(this.loadingSteps().length);
    try {
      sessionStorage.setItem('cv-creator:step', '0');
    } catch {
      /* storage blocked – the editor starts at step 0 anyway */
    }
    setTimeout(() => this.router.navigateByUrl('/editor'), 450);
  }
}
