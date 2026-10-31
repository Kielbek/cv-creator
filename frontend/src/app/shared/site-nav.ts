import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LucideAngularModule, Logo, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <nav class="relative mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-8">
        <a routerLink="/" aria-label="Home"><app-logo /></a>
        <div class="hidden items-center gap-6 text-[14px] text-muted md:flex">
          <a routerLink="/templates" routerLinkActive="text-ink" class="transition hover:text-ink">{{ 'nav.templates' | translate }}</a>
          <a routerLink="/" fragment="features" class="transition hover:text-ink">{{ 'nav.features' | translate }}</a>
          <a routerLink="/" fragment="faq" class="transition hover:text-ink">FAQ</a>
        </div>
        <div class="ml-auto flex items-center gap-1.5">
          <app-language-switcher />
          <a routerLink="/start" class="btn-primary btn-sm hidden sm:inline-flex">{{ 'nav.create' | translate }}</a>
          <button type="button" class="icon-btn max-md:inline-flex! md:hidden!" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Menu">
            <lucide-icon [img]="open() ? icons.X : icons.Menu" class="size-5" />
          </button>
        </div>
        @if (open()) {
          <div class="absolute inset-x-4 top-full mt-2 rounded-xl border border-line bg-white p-2 shadow-[0_8px_30px_rgb(0_0_0/0.08)] md:hidden">
            <a routerLink="/templates" class="menu-item" (click)="open.set(false)">{{ 'nav.templates' | translate }}</a>
            <a routerLink="/" fragment="features" class="menu-item" (click)="open.set(false)">{{ 'nav.features' | translate }}</a>
            <a routerLink="/" fragment="faq" class="menu-item" (click)="open.set(false)">FAQ</a>
            <a routerLink="/start" class="btn-primary mt-2 w-full">{{ 'nav.create' | translate }}</a>
          </div>
        }
      </nav>
    </header>
  `,
})
export class SiteNav {
  protected readonly open = signal(false);
  protected readonly icons = { Menu, X };
}
