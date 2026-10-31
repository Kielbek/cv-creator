import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';
import { UI_LANGUAGES, UiLanguage } from '../core/i18n/ui-language';

@Component({
  selector: 'app-language-switcher',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button type="button" class="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13.5px] font-medium text-muted transition hover:text-ink" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-haspopup="listbox" aria-label="Language">
        {{ current().code.toUpperCase() }}
        <lucide-icon [img]="icons.ChevronDown" class="size-3.5" />
      </button>
      @if (open()) {
        <ul class="absolute right-0 bottom-auto z-40 mt-1 w-40 rounded-xl border border-line bg-white p-1 shadow-[0_8px_30px_rgb(0_0_0/0.08)]" role="listbox" (mouseleave)="open.set(false)">
          @for (l of langs; track l.code) {
            <li>
              <button type="button" role="option" [attr.aria-selected]="l.code === current().code" class="menu-item justify-between" (click)="pick(l.code)">
                {{ l.name }}
                @if (l.code === current().code) {
                  <lucide-icon [img]="icons.Check" class="size-3.5" />
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
