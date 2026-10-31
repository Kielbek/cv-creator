import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowDown, ArrowUp, ImagePlus, Plus, Sparkles, Trash2, Wand2, X } from 'lucide-angular';
import { CvStore } from '../../../core/cv/cv.store';
import {
  Cv,
  ExperienceItem,
  newCertificate,
  newEducation,
  newExperience,
  newLanguage,
  newProject,
  newSkill,
} from '../../../core/cv/cv.model';
import { AiError, AiService } from '../../../core/ai/ai.service';
import { Toasts } from '../../../shared/toasts';

type ListKey = 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certificates';
export type Panel = 'personal' | 'summary' | ListKey | 'interests' | 'consent';

const FACTORIES: Record<ListKey, () => { id: string }> = {
  experience: newExperience,
  education: newEducation,
  skills: newSkill,
  languages: newLanguage,
  projects: newProject,
  certificates: newCertificate,
};

/** All the content forms. Every keystroke goes straight to the store → live preview. */
@Component({
  selector: 'app-content-panel',
  imports: [TranslatePipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-panel.html',
})
export class ContentPanel {
  protected readonly store = inject(CvStore);
  protected readonly ai = inject(AiService);
  private readonly toasts = inject(Toasts);
  protected readonly cv = this.store.cv;
  protected readonly icons = { ArrowDown, ArrowUp, ImagePlus, Plus, Sparkles, Trash2, Wand2, X };

  /** Which sections to show (the wizard step). */
  readonly sections = input<Panel[]>(['personal']);
  protected readonly multi = computed(() => this.sections().length > 1);
  protected readonly busy = signal<string | null>(null);
  protected readonly tone = signal('professional');
  /** AI bullet proposals per experience id */
  protected readonly proposals = signal<Record<string, string[]>>({});

  protected readonly levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'];

  protected has(p: Panel): boolean {
    return this.sections().includes(p);
  }

  protected set(fn: (cv: Cv) => void): void {
    this.store.update(fn);
  }

  protected val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected setPersonal(key: keyof Cv['personal'], e: Event): void {
    const v = this.val(e);
    this.set((cv) => (cv.personal[key] = v));
  }

  protected setShow(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.set((cv) => (cv.design.showPhoto = checked));
  }

  protected setItem(list: ListKey, i: number, key: string, value: string | number | boolean): void {
    this.set((cv) => ((cv[list][i] as unknown as Record<string, unknown>)[key] = value));
  }

  protected add(list: ListKey): void {
    this.set((cv) => (cv[list] as { id: string }[]).push(FACTORIES[list]()));
  }

  protected remove(list: ListKey, i: number): void {
    this.store.update((cv) => cv[list].splice(i, 1), true);
  }

  protected move(list: ListKey, i: number, dir: -1 | 1): void {
    this.set((cv) => {
      const arr = cv[list] as unknown[];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    });
  }

  protected count(list: ListKey): number {
    return this.cv()[list].length;
  }

  // ---- photo: resized in the browser, stored as data URL, never uploaded -----------------------------------------

  protected async onPhoto(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const bitmap = await createImageBitmap(file);
    const size = 400;
    const scale = size / Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
    const url = canvas.toDataURL('image/jpeg', 0.86);
    this.set((cv) => (cv.personal.photo = url));
  }

  // ---- AI --------------------------------------------------------------------------------------------------------

  protected async generateSummary(): Promise<void> {
    if (!this.ensureAi()) return;
    this.busy.set('summary');
    try {
      const r = await this.ai.summary(this.cv(), this.tone());
      this.store.update((cv) => (cv.summary = r.summary), true);
      this.toasts.show('ai.done');
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(null);
    }
  }

  protected async improve(item: ExperienceItem): Promise<void> {
    if (!this.ensureAi()) return;
    if (!item.description.trim()) {
      this.toasts.show('ai.needText', 'warn');
      return;
    }
    this.busy.set(item.id);
    try {
      const r = await this.ai.improve(this.cv(), item.position, item.company, item.description);
      this.proposals.update((p) => ({ ...p, [item.id]: r.bullets }));
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(null);
    }
  }

  protected accept(i: number, id: string): void {
    const bullets = this.proposals()[id];
    this.store.update((cv) => (cv.experience[i].description = bullets.join('\n')), true);
    this.discard(id);
  }

  protected discard(id: string): void {
    this.proposals.update(({ [id]: _, ...rest }) => rest);
  }

  private ensureAi(): boolean {
    if (this.ai.enabled()) return true;
    this.toasts.show('ai.disabled', 'warn');
    return false;
  }

  private fail(e: unknown): void {
    const code = e instanceof AiError ? e.code : 'ai_unavailable';
    this.toasts.show(`ai.error.${code}`, 'error');
  }
}
