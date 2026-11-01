import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Logo } from './logo';
import { UI_LANGUAGES, UiLanguage } from '../core/i18n/ui-language';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, TranslatePipe, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-[#e6e6e6] bg-white">
      <div class="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div class="max-w-xs">
          <app-logo />
          <p class="mt-4 text-[14px] leading-relaxed text-[#737373]">{{ 'footer.tagline' | translate }}</p>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a8a8a] uppercase">{{ 'footer.product' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            <li><a routerLink="/start" class="hover:underline">{{ 'nav.create' | translate }}</a></li>
            <li><a routerLink="/templates" class="hover:underline">{{ 'nav.templates' | translate }}</a></li>
            <li><a routerLink="/start" [queryParams]="{ mode: 'import' }" class="hover:underline">{{ 'home.v2.ctaUpload' | translate }}</a></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a8a8a] uppercase">{{ 'footer.help' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            <li><a routerLink="/" fragment="how" class="hover:underline">{{ 'nav.how' | translate }}</a></li>
            <li><a routerLink="/" fragment="features" class="hover:underline">{{ 'nav.features' | translate }}</a></li>
            <li><a routerLink="/" fragment="faq" class="hover:underline">FAQ</a></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a8a8a] uppercase">{{ 'footer.language' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            @for (l of langs; track l.code) {
              <li>
                <button type="button" class="inline-flex items-center gap-2 hover:underline" [class.font-semibold]="ui.current() === l.code" (click)="ui.use(l.code)">
                  <img class="flag" [src]="'flags/' + l.flag + '.svg'" alt="" /> {{ l.name }}
                </button>
              </li>
            }
          </ul>
        </div>
      </div>
      <div class="border-t border-[#e6e6e6]">
        <p class="mx-auto max-w-6xl px-5 py-6 text-[12.5px] text-[#8a8a8a] sm:px-8">© {{ year }} {{ 'footer.rights' | translate }}</p>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly ui = inject(UiLanguage);
  protected readonly langs = UI_LANGUAGES;
  protected readonly year = new Date().getFullYear();
}
