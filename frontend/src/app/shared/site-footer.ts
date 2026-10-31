import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Logo } from './logo';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, TranslatePipe, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <app-logo [dark]="false" />
          <p class="mt-2 max-w-sm text-sm text-slate-500">{{ 'footer.tagline' | translate }}</p>
        </div>
        <div class="flex flex-wrap gap-6 text-sm text-slate-600">
          <a routerLink="/templates" class="hover:text-brand-600">{{ 'nav.templates' | translate }}</a>
          <a routerLink="/editor" class="hover:text-brand-600">{{ 'nav.create' | translate }}</a>
          <a routerLink="/" fragment="faq" class="hover:text-brand-600">FAQ</a>
        </div>
      </div>
      <p class="pb-8 text-center text-xs text-slate-400">© {{ year }} {{ 'footer.rights' | translate }}</p>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
