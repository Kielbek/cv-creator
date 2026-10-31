import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface UiLang {
  code: string;
  name: string;
  flag: string;
}

/** Languages of the app interface. Add one: a JSON file in public/i18n + an entry here. */
export const UI_LANGUAGES: readonly UiLang[] = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const KEY = 'cv-creator:ui-lang';

@Injectable({ providedIn: 'root' })
export class UiLanguage {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly current = signal('en');

  init(): void {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    const browser = (navigator.language || 'en').slice(0, 2);
    const code = [saved, browser].find((c) => c && UI_LANGUAGES.some((l) => l.code === c)) ?? 'en';
    this.use(code);
  }

  use(code: string): void {
    this.current.set(code);
    this.translate.use(code);
    this.document.documentElement.lang = code;
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }
}
