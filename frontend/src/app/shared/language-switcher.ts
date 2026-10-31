import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideAngularModule, Globe, ChevronDown, Check } from 'lucide-angular';
import { UI_LANGUAGES, UiLanguage } from '../core/i18n/ui-language';

@Component({
  selector: 'app-language-switcher',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition"
        [class]="dark() ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100'"
        (click)="open.set(!open())"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        aria-label="Language"
      >
        <lucide-icon [img]="icons.Globe" class="size-4" /> {{ current().code.toUpperCase() }}
        <lucide-icon [img]="icons.ChevronDown" class="size-3.5 opacity-60" />
      </button>
      @if (open()) {
        <ul class="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl" role="listbox" (mouseleave)="open.set(false)">
          @for (l of langs; track l.code) {
            <li>
              <button type="button" role="option" [attr.aria-selected]="l.code === current().code" class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50" (click)="pick(l.code)">
                <span>{{ l.flag }}</span><span class="flex-1 text-left">{{ l.name }}</span>
                @if (l.code === current().code) {
                  <lucide-icon [img]="icons.Check" class="size-4 text-brand-500" />
                }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class LanguageSwitcher {
  readonly dark = input(true);
  private readonly ui = inject(UiLanguage);
  protected readonly icons = { Globe, ChevronDown, Check };
  protected readonly langs = UI_LANGUAGES;
  protected readonly open = signal(false);
  protected readonly current = computed(() => UI_LANGUAGES.find((l) => l.code === this.ui.current()) ?? UI_LANGUAGES[1]);

  protected pick(code: string): void {
    this.ui.use(code);
    this.open.set(false);
  }
}
