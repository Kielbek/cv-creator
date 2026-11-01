import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';
import { UI_LANGUAGES, UiLanguage } from '../core/i18n/ui-language';

@Component({
  selector: 'app-language-switcher',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13.5px] font-medium transition" [class.justify-center]="compact()" [class.w-full]="compact()"
        [class]="dark() ? 'text-white/85 hover:bg-white/10' : 'text-ink-2 hover:bg-paper-2'"
        (click)="open.set(!open())"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        aria-label="Language"
      >
        <img class="flag" [src]="'flags/' + current().flag + '.svg'" alt="" />
        @if (!compact()) {
          {{ current().code.toUpperCase() }}
          <lucide-icon [img]="icons.ChevronDown" class="size-3.5 opacity-60" />
        }
      </button>
      @if (open()) {
        <ul class="absolute z-40 mt-1 w-48 rounded-xl border border-line bg-white p-1.5 text-ink shadow-[0_12px_40px_-8px_rgb(10_26_63/0.25)]" [class]="up() ? 'bottom-full mb-1 left-0' : 'right-0'" role="listbox" (mouseleave)="open.set(false)">
          @for (l of langs; track l.code) {
            <li>
              <button type="button" role="option" [attr.aria-selected]="l.code === current().code" class="menu-item" [class.bg-primary-soft]="l.code === current().code" (click)="pick(l.code)">
                <img class="flag" [src]="'flags/' + l.flag + '.svg'" alt="" />
                <span class="flex-1">{{ l.name }}</span>
                @if (l.code === current().code) {
                  <lucide-icon [img]="icons.Check" class="size-4 text-primary" />
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
  readonly dark = input(false);
  /** open the menu upwards (bottom of a sidebar) */
  readonly up = input(false);
  /** flag only */
  readonly compact = input(false);
  private readonly ui = inject(UiLanguage);
  protected readonly icons = { ChevronDown, Check };
  protected readonly langs = UI_LANGUAGES;
  protected readonly open = signal(false);
  protected readonly current = computed(() => UI_LANGUAGES.find((l) => l.code === this.ui.current()) ?? UI_LANGUAGES[1]);

  protected pick(code: string): void {
    this.ui.use(code);
    this.open.set(false);
  }
}
