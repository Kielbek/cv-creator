import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Languages, Sparkles, Target, Check, Plus } from 'lucide-angular';
import { CvStore, applyCountry } from '../../../core/cv/cv.store';
import { AiError, AiService, TailorResult, mergeCvText } from '../../../core/ai/ai.service';
import { CV_LANGUAGES } from '../../../core/cv/cv-labels';
import { COUNTRIES } from '../../../core/cv/countries';
import { newSkill } from '../../../core/cv/cv.model';
import { Toasts } from '../../../shared/toasts';
import { UiLanguage } from '../../../core/i18n/ui-language';
import { Select, SelectOption } from '../../../shared/form/select';

@Component({
  selector: 'app-ai-panel',
  imports: [TranslatePipe, LucideAngularModule, Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      @if (ai.enabled() === false) {
        <div class="rounded-xl border border-line-2 bg-white p-3 text-sm text-ink-2">{{ 'ai.disabled' | translate }}</div>
      }

      <!-- tailor to a job offer -->
      <div class="panel-card space-y-3 p-4">
        <h3 class="flex items-center gap-2 text-[14px] font-medium text-ink"><lucide-icon [img]="icons.Target" class="size-4 text-brand-500" /> {{ 'ai.tailor.title' | translate }}</h3>
        <p class="text-xs text-slate-500">{{ 'ai.tailor.hint' | translate }}</p>
        <textarea class="input min-h-36" [value]="offer()" (input)="offer.set($any($event.target).value)" [placeholder]="'ai.tailor.placeholder' | translate"></textarea>
        <button type="button" class="btn-primary w-full" (click)="tailor()" [disabled]="busy() !== null || offer().trim().length < 50">
          <lucide-icon [img]="icons.Sparkles" class="size-4" [class.animate-spin]="busy() === 'tailor'" /> {{ 'ai.tailor.run' | translate }}
        </button>

        @if (result(); as r) {
          <div class="space-y-4 border-t border-slate-100 pt-4">
            <div class="flex items-center gap-4">
              <div class="relative size-20 shrink-0">
                <svg viewBox="0 0 36 36" class="size-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef0f6" stroke-width="3.2" />
                  <circle cx="18" cy="18" r="15.9" fill="none" [attr.stroke]="scoreColor()" stroke-width="3.2" stroke-linecap="round" [attr.stroke-dasharray]="r.matchScore + ' 100'" />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">{{ r.matchScore }}%</span>
              </div>
              <p class="text-sm text-slate-600">{{ 'ai.tailor.score' | translate }}</p>
            </div>
            @if (r.missingKeywords.length) {
              <div>
                <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{{ 'ai.tailor.missing' | translate }}</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (k of r.missingKeywords; track k) {
                    <button type="button" class="inline-flex items-center gap-1 rounded-md border border-line-2 bg-white px-2.5 py-1 text-xs text-ink-2 hover:border-ink" (click)="addSkill(k)" [title]="'ai.tailor.addSkill' | translate">
                      <lucide-icon [img]="icons.Plus" class="size-3" /> {{ k }}
                    </button>
                  }
                </div>
                <p class="mt-1 text-[11px] text-slate-400">{{ 'ai.tailor.honest' | translate }}</p>
              </div>
            }
            @if (r.matchedKeywords.length) {
              <div>
                <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{{ 'ai.tailor.matched' | translate }}</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (k of r.matchedKeywords; track k) {
                    <span class="inline-flex items-center gap-1 rounded-md bg-paper-2 px-2.5 py-1 text-xs text-ink-2"><lucide-icon [img]="icons.Check" class="size-3" /> {{ k }}</span>
                  }
                </div>
              </div>
            }
            <div>
              <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{{ 'ai.tailor.suggestions' | translate }}</p>
              <ol class="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                @for (s of r.suggestions; track $index) {
                  <li>{{ s }}</li>
                }
              </ol>
            </div>
            @if (r.tailoredSummary) {
              <div class="rounded-xl border border-brand-200 bg-brand-50 p-3">
                <p class="mb-1 text-xs font-medium text-brand-800">{{ 'ai.tailor.newSummary' | translate }}</p>
                <p class="text-sm text-slate-700">{{ r.tailoredSummary }}</p>
                <button type="button" class="btn-primary mt-2 px-3! py-1.5! text-sm" (click)="useSummary(r.tailoredSummary)">{{ 'ai.tailor.useSummary' | translate }}</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- translate -->
      <div class="panel-card space-y-3 p-4">
        <h3 class="flex items-center gap-2 text-[14px] font-medium text-ink"><lucide-icon [img]="icons.Languages" class="size-4 text-brand-500" /> {{ 'ai.translate.title' | translate }}</h3>
        <p class="text-xs text-slate-500">{{ 'ai.translate.hint' | translate }}</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="tl">{{ 'ai.translate.language' | translate }}</label>
            <ui-select inputId="tl" [options]="langOptions()" [value]="targetLang()" (valueChange)="targetLang.set($event)" [searchPlaceholder]="'common.search' | translate" />
          </div>
          <div>
            <label class="label" for="tc">{{ 'ai.translate.country' | translate }}</label>
            <ui-select inputId="tc" [options]="countryOptions()" [value]="targetCountry()" (valueChange)="targetCountry.set($event)" [searchPlaceholder]="'common.search' | translate" />
          </div>
        </div>
        <button type="button" class="btn-primary w-full" (click)="translate()" [disabled]="busy() !== null || targetLang() === store.cv().language">
          <lucide-icon [img]="icons.Languages" class="size-4" [class.animate-pulse]="busy() === 'translate'" /> {{ 'ai.translate.run' | translate }}
        </button>
        <p class="text-[11px] text-slate-400">{{ 'ai.translate.undo' | translate }}</p>
      </div>

      <p class="px-1 text-[11px] leading-relaxed text-slate-400">{{ 'ai.privacy' | translate }}</p>
    </div>
  `,
})
export class AiPanel {
  protected readonly store = inject(CvStore);
  protected readonly ai = inject(AiService);
  private readonly toasts = inject(Toasts);
  private readonly ui = inject(UiLanguage);
  protected readonly icons = { Languages, Sparkles, Target, Check, Plus };
  protected readonly languages = CV_LANGUAGES;
  protected readonly countries = COUNTRIES;

  protected readonly offer = signal('');
  protected readonly busy = signal<'tailor' | 'translate' | null>(null);
  protected readonly result = signal<TailorResult | null>(null);
  protected readonly targetLang = signal(this.store.cv().language === 'en' ? 'de' : 'en');
  protected readonly targetCountry = signal(this.store.cv().language === 'en' ? 'DE' : 'GB');

  protected readonly langOptions = computed<SelectOption[]>(() =>
    this.languages
      .filter((l) => l !== this.store.cv().language)
      .map((l) => ({ value: l, label: this.cap(this.langName(l)), flag: ({ en: 'gb', cs: 'cz', uk: 'ua' } as Record<string, string>)[l] ?? l })),
  );
  protected readonly countryOptions = computed<SelectOption[]>(() =>
    this.countries.map((c) => ({ value: c.code, label: this.countryName(c.code), flag: c.code.toLowerCase() })).sort((a, b) => a.label.localeCompare(b.label)),
  );

  private cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  protected readonly scoreColor = computed(() => {
    const s = this.result()?.matchScore ?? 0;
    return s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  });

  protected langName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'language' }).of(code) ?? code;
  }

  protected countryName(code: string): string {
    return new Intl.DisplayNames([this.ui.current()], { type: 'region' }).of(code) ?? code;
  }

  protected async tailor(): Promise<void> {
    if (!this.ai.enabled()) return this.toasts.show('ai.disabled', 'warn');
    this.busy.set('tailor');
    try {
      this.result.set(await this.ai.tailor(this.store.cv(), this.offer()));
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(null);
    }
  }

  protected useSummary(text: string): void {
    this.store.update((cv) => (cv.summary = text), true);
    this.toasts.show('ai.done');
  }

  protected addSkill(name: string): void {
    this.store.update((cv) => {
      if (!cv.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) cv.skills.push({ ...newSkill(), name });
    }, true);
    this.result.update((r) => (r ? { ...r, missingKeywords: r.missingKeywords.filter((k) => k !== name) } : r));
  }

  protected async translate(): Promise<void> {
    if (!this.ai.enabled()) return this.toasts.show('ai.disabled', 'warn');
    this.busy.set('translate');
    try {
      const lang = this.targetLang();
      const country = this.targetCountry();
      const text = await this.ai.translate(this.store.cv(), lang, country);
      this.store.update((cv) => {
        mergeCvText(cv, text);
        applyCountry(cv, country, false);
        cv.language = lang;
      }, true);
      this.toasts.show('ai.translate.done');
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(null);
    }
  }

  private fail(e: unknown): void {
    this.toasts.show(`ai.error.${e instanceof AiError ? e.code : 'ai_unavailable'}`, 'error');
  }
}
