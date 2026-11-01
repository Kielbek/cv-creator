import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowLeft, ChevronRight, GripVertical, Plus, Sparkles, Trash2, X } from 'lucide-angular';
import { CvStore } from '../../../core/cv/cv.store';
import { Cv, ExperienceItem, newCertificate, newEducation, newExperience, newLanguage, newProject, uid } from '../../../core/cv/cv.model';
import { formatRange, formatMonth } from '../../../core/cv/cv-labels';
import { AiError, AiService } from '../../../core/ai/ai.service';
import { Toasts } from '../../../shared/toasts';
import { CV_LANGUAGES } from '../../../core/cv/cv-labels';
import { COUNTRIES } from '../../../core/cv/countries';
import { UiLanguage } from '../../../core/i18n/ui-language';
import { MonthPicker } from '../../../shared/form/month-picker';
import { Switch } from '../../../shared/form/switch';
import { TagInput } from '../../../shared/form/tag-input';

type ListKey = 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certificates';
export type Panel = 'personal' | 'summary' | ListKey | 'interests' | 'consent';

const FACTORIES = {
  experience: newExperience,
  education: newEducation,
  languages: newLanguage,
  projects: newProject,
  certificates: newCertificate,
} as const;

/** The content forms of one wizard step. Every keystroke goes straight to the store → live preview. */
@Component({
  selector: 'app-content-panel',
  imports: [TranslatePipe, LucideAngularModule, CdkDropList, CdkDrag, CdkDragHandle, MonthPicker, Switch, TagInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-panel.html',
})
export class ContentPanel {
  protected readonly store = inject(CvStore);
  protected readonly ai = inject(AiService);
  private readonly toasts = inject(Toasts);
  private readonly ui = inject(UiLanguage);
  protected readonly cvLanguages = CV_LANGUAGES;
  protected readonly countries = COUNTRIES;

  protected langName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'language' }).of(code) ?? code;
  }

  protected countryName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'region' }).of(code) ?? code;
  }

  protected setLanguage(code: string): void {
    this.store.update((cv) => (cv.language = code), true);
  }
  protected readonly cv = this.store.cv;
  protected readonly icons = { ArrowLeft, ChevronRight, GripVertical, Plus, Sparkles, Trash2, X };

  /** Which sections to show (the wizard step). */
  readonly sections = input<Panel[]>(['personal']);
  protected readonly multi = computed(() => this.sections().length > 1);

  /** id of the entry whose form is expanded */
  protected readonly openId = signal<string | null>(null);
  protected readonly busy = signal<string | null>(null);
  protected readonly tone = signal('professional');
  protected readonly proposals = signal<Record<string, string[]>>({});
  protected readonly levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'];
  protected readonly showSkillLevels = computed(() => ['bars', 'dots'].includes(this.store.geometry().template.skills));

  /** education types offered before the first school is added */
  protected readonly schoolTypes = ['highSchool', 'technical', 'university', 'postSecondary', 'vocational', 'other'];

  constructor() {
    // the experience step opens straight into the form of the first job
    effect(() => {
      const sections = this.sections();
      untracked(() => {
        this.openId.set(null);
        if (sections.includes('experience') && this.cv().experience.length === 0) this.add('experience');
      });
    });
  }

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

  protected setItem(list: ListKey, i: number, key: string, value: string | number | boolean): void {
    this.set((cv) => ((cv[list][i] as unknown as Record<string, unknown>)[key] = value));
  }

  // ---- entries -----------------------------------------------------------------------------------------------------

  protected open(id: string): void {
    this.openId.set(id);
  }

  /** index of the entry of `list` currently being edited, or -1 */
  protected editing(list: 'experience' | 'education' | 'projects' | 'certificates'): number {
    const id = this.openId();
    return id ? this.cv()[list].findIndex((e) => e.id === id) : -1;
  }

  protected close(): void {
    this.openId.set(null);
    this.store.pruneBlank();
  }

  protected addSchool(type: string, label: string): void {
    const item = newEducation();
    if (type !== 'other') item.degree = label;
    this.set((cv) => cv.education.push(item));
    this.openId.set(item.id);
  }

  protected add(list: keyof typeof FACTORIES): void {
    const item = FACTORIES[list]();
    this.set((cv) => (cv[list] as { id: string }[]).push(item));
    this.openId.set(item.id);
  }

  protected remove(list: ListKey, i: number, e?: Event): void {
    e?.stopPropagation();
    this.store.update((cv) => cv[list].splice(i, 1), true);
    this.openId.set(null);
  }

  protected reorder(list: ListKey, e: CdkDragDrop<unknown>): void {
    if (e.previousIndex === e.currentIndex) return;
    this.set((cv) => moveItemInArray(cv[list] as unknown[], e.previousIndex, e.currentIndex));
  }

  protected range(start: string, end: string, current: boolean): string {
    return formatRange(start, end, current, this.cv().language);
  }

  protected month(v: string): string {
    return formatMonth(v, this.cv().language);
  }

  protected join(...parts: string[]): string {
    return parts.filter(Boolean).join(' · ');
  }

  // ---- skills ------------------------------------------------------------------------------------------------------

  protected addSkill(name: string): void {
    this.set((cv) => cv.skills.push({ id: uid(), name, level: 0 }));
  }

  protected removeSkill(id: string): void {
    this.set((cv) => (cv.skills = cv.skills.filter((s) => s.id !== id)));
  }

  protected rate(i: number, level: number): void {
    this.set((cv) => (cv.skills[i].level = cv.skills[i].level === level ? 0 : level));
  }

  // ---- photo: resized in the browser, stored as data URL, never uploaded -------------------------------------------

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
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    canvas.getContext('2d')!.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
    const url = canvas.toDataURL('image/jpeg', 0.86);
    this.set((cv) => {
      cv.personal.photo = url;
      cv.design.showPhoto = true;
    });
  }

  // ---- AI ----------------------------------------------------------------------------------------------------------

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
    if (!item.description.trim()) return this.toasts.show('ai.needText', 'warn');
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
    this.toasts.show(`ai.error.${e instanceof AiError ? e.code : 'ai_unavailable'}`, 'error');
  }
}
