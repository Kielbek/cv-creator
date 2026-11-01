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
    <footer class="border-t border-[#e6eaf1] bg-white">
      <div class="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div class="max-w-xs">
          <app-logo />
          <p class="mt-4 text-[14px] leading-relaxed text-[#586174]">{{ 'footer.tagline' | translate }}</p>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a93a6] uppercase">{{ 'footer.product' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            <li><a routerLink="/start" class="hover:text-[#4b45d5]">{{ 'nav.create' | translate }}</a></li>
            <li><a routerLink="/templates" class="hover:text-[#4b45d5]">{{ 'nav.templates' | translate }}</a></li>
            <li><a routerLink="/start" [queryParams]="{ mode: 'import' }" class="hover:text-[#4b45d5]">{{ 'home.v2.ctaUpload' | translate }}</a></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a93a6] uppercase">{{ 'footer.help' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            <li><a routerLink="/" fragment="how" class="hover:text-[#4b45d5]">{{ 'nav.how' | translate }}</a></li>
            <li><a routerLink="/" fragment="features" class="hover:text-[#4b45d5]">{{ 'nav.features' | translate }}</a></li>
            <li><a routerLink="/" fragment="faq" class="hover:text-[#4b45d5]">FAQ</a></li>
          </ul>
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.08em] text-[#8a93a6] uppercase">{{ 'footer.language' | translate }}</p>
          <ul class="mt-4 space-y-2.5 text-[14px]">
            @for (l of langs; track l.code) {
              <li>
                <button type="button" class="inline-flex items-center gap-2 hover:text-[#4b45d5]" [class.font-semibold]="ui.current() === l.code" (click)="ui.use(l.code)">
                  <img class="flag" [src]="'flags/' + l.flag + '.svg'" alt="" /> {{ l.name }}
                </button>
              </li>
            }
          </ul>
        </div>
      </div>
      <div class="border-t border-[#e6eaf1]">
        <p class="mx-auto max-w-6xl px-5 py-6 text-[12.5px] text-[#8a93a6] sm:px-8">© {{ year }} {{ 'footer.rights' | translate }}</p>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly ui = inject(UiLanguage);
  protected readonly langs = UI_LANGUAGES;
  protected readonly year = new Date().getFullYear();
}
