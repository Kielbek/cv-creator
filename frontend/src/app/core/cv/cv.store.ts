import { Injectable, computed, effect, signal } from '@angular/core';
import { Cv, SectionId, isBlank } from './cv.model';
import { emptyCv, defaultDesign } from './sample';
import { clampColumns, dedupe, defaultLayout, findTemplate, geometry, refitLayout } from './templates';
import { findCountry } from './countries';

const KEY = 'cv-creator:cv:v1';
const UNDO_LIMIT = 30;

/**
 * Holds the CV being edited. Saved to localStorage on every change (debounced), so the user never loses work and
 * nothing leaves the browser except the texts sent to the AI on explicit request.
 */
@Injectable({ providedIn: 'root' })
export class CvStore {
  private readonly state = signal<Cv>(this.load());
  private readonly undoStack: Cv[] = [];
  readonly canUndo = signal(false);

  readonly cv = this.state.asReadonly();
  readonly geometry = computed(() => geometry(this.state().design));
  readonly country = computed(() => findCountry(this.state().country));

  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const cv = this.state();
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(cv));
        } catch {
          /* private mode / quota: keep working in memory */
        }
      }, 300);
    });
  }

  /** Immutable update. `checkpoint` = remember the previous state for undo (use for bigger, discrete changes). */
  update(fn: (draft: Cv) => void, checkpoint = false): void {
    const prev = this.state();
    const next = structuredClone(prev);
    fn(next);
    next.updatedAt = new Date().toISOString();
    if (checkpoint) this.pushUndo(prev);
    this.state.set(next);
  }

  replace(cv: Cv): void {
    this.pushUndo(this.state());
    this.state.set(migrate(cv));
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (prev) this.state.set(prev);
    this.canUndo.set(this.undoStack.length > 0);
  }

  setTemplate(id: string): void {
    this.update((cv) => {
      const t = findTemplate(id);
      cv.design.templateId = t.id;
      cv.design.accent = null;
      cv.design.font = null;
      cv.design.layout = refitLayout(cv.design.layout, t, t.columns);
    }, true);
  }

  /** Drops untouched draft entries (called when leaving a step). */
  pruneBlank(): void {
    const cv = this.state();
    const lists = ['experience', 'education', 'projects', 'certificates', 'languages'] as const;
    if (!lists.some((k) => (cv[k] as object[]).some((i) => isBlank(i)))) return;
    this.update((d) => lists.forEach((k) => ((d[k] as object[]) = (d[k] as object[]).filter((i) => !isBlank(i)))));
  }

  setLayout(layout: SectionId[][]): void {
    this.update((cv) => (cv.design.layout = dedupe(layout)));
  }

  setCountry(code: string, adoptLanguage: boolean): void {
    this.update((cv) => applyCountry(cv, code, adoptLanguage), true);
  }

  reset(language: string, country: string): void {
    this.replace(emptyCv(language, country));
  }

  private pushUndo(cv: Cv): void {
    this.undoStack.push(cv);
    if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
    this.canUndo.set(true);
  }

  private load(): Cv {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch {
      /* corrupted or unavailable storage → start fresh */
    }
    const lang = (navigator.language || 'en').slice(0, 2);
    const preset = findCountry(lang === 'en' ? 'GB' : lang.toUpperCase());
    return emptyCv(preset.language, preset.code);
  }
}

/** Fills fields added in newer app versions so old saved CVs keep working. */
export function migrate(input: Partial<Cv>): Cv {
  const base = emptyCv(input.language ?? 'en', input.country ?? 'PL');
  const cv: Cv = { ...base, ...input, personal: { ...base.personal, ...input.personal }, version: 1 } as Cv;
  cv.design = { ...defaultDesign(cv.design?.templateId ?? 'atlas', cv.country), ...input.design } as Cv['design'];
  delete (cv.design as unknown as Record<string, unknown>)['columns']; // older saves could override the skeleton
  for (const k of ['experience', 'education', 'skills', 'languages', 'projects', 'certificates'] as const) {
    if (!Array.isArray(cv[k])) (cv as unknown as Record<string, unknown[]>)[k] = [];
  }
  const g = geometry(cv.design);
  const cols = clampColumns(g.columns);
  if (!Array.isArray(cv.design.layout) || cv.design.layout.flat().length === 0) {
    cv.design.layout = defaultLayout(g.template, cols);
  } else if (cv.design.layout.length !== cols) {
    cv.design.layout = refitLayout(cv.design.layout, g.template, cols);
  }
  return cv;
}

/** Switches the target country: page size, consent clause (unless the user wrote their own), optionally language. */
export function applyCountry(cv: Cv, code: string, adoptLanguage: boolean): void {
  const prev = findCountry(cv.country);
  const next = findCountry(code);
  cv.country = next.code;
  cv.design.pageSize = next.pageSize;
  if (adoptLanguage) cv.language = next.language;
  if (!cv.consent.trim() || cv.consent === prev.consent) cv.consent = next.consent ?? '';
}
