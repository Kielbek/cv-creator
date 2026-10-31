import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Logo } from './logo';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, TranslatePipe, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:justify-between sm:px-8">
        <div class="max-w-xs">
          <app-logo />
          <p class="mt-3 text-[13.5px] leading-relaxed text-muted">{{ 'footer.tagline' | translate }}</p>
        </div>
        <div class="flex gap-10 text-[13.5px] text-muted">
          <a routerLink="/templates" class="hover:text-ink">{{ 'nav.templates' | translate }}</a>
          <a routerLink="/start" class="hover:text-ink">{{ 'nav.create' | translate }}</a>
          <a routerLink="/" fragment="faq" class="hover:text-ink">FAQ</a>
        </div>
      </div>
      <p class="mx-auto max-w-6xl px-5 pb-10 text-[12.5px] text-faint sm:px-8">© {{ year }} {{ 'footer.rights' | translate }}</p>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
