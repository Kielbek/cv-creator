import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Download,
  Eye,
  FileJson,
  FileUp,
  LayoutGrid,
  Lightbulb,
  Minus,
  MoreHorizontal,
  Palette,
  PencilLine,
  Plus,
  RotateCcw,
  Sparkles,
  Undo2,
  CircleCheck,
  Circle,
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

type Tab = 'content' | 'layout' | 'design' | 'ai';

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
  private readonly document = inject(DOCUMENT);
  protected readonly icons = { Download, Eye, FileJson, FileUp, LayoutGrid, Lightbulb, Minus, MoreHorizontal, Palette, PencilLine, Plus, RotateCcw, Sparkles, Undo2, CircleCheck, Circle };

  protected readonly cv = this.store.cv;
  protected readonly tab = signal<Tab>('content');
  protected readonly mobileView = signal<'edit' | 'preview'>('edit');
  protected readonly zoom = signal(0.8);
  protected readonly menuOpen = signal(false);
  protected readonly showChecklist = signal(false);

  protected readonly tabs: { id: Tab; icon: typeof PencilLine }[] = [
    { id: 'content', icon: PencilLine },
    { id: 'layout', icon: LayoutGrid },
    { id: 'design', icon: Palette },
    { id: 'ai', icon: Sparkles },
  ];

  protected readonly languages = CV_LANGUAGES;
  protected readonly countries = COUNTRIES;
  protected readonly checklist = computed(() => checks(this.cv()));
  protected readonly score = computed(() => score(this.checklist()));
  protected readonly pageCount = signal(1);

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

  protected zoomBy(d: number): void {
    this.zoom.update((z) => Math.min(1.5, Math.max(0.4, Math.round((z + d) * 10) / 10)));
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
    this.mobileView.set('preview');
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
    if (!confirm(this.translateConfirm())) return;
    const cv = this.cv();
    this.store.reset(cv.language, cv.country);
    this.toasts.show('editor.menu.resetDone');
  }

  private translateConfirm(): string {
    return this.document.querySelector<HTMLElement>('[data-confirm-reset]')?.dataset['confirmReset'] ?? 'Reset?';
  }
}
