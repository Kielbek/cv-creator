import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ArrowRight, Menu, X } from 'lucide-angular';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, Logo, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="relative z-20 mx-auto flex max-w-7xl items-center gap-6 px-4 py-5 sm:px-6">
      <a routerLink="/" aria-label="Home"><app-logo [dark]="dark()" /></a>
      <div class="hidden items-center gap-7 text-sm font-medium md:flex" [class]="dark() ? 'text-white/75' : 'text-slate-600'">
        <a routerLink="/templates" class="transition hover:text-brand-400">{{ 'nav.templates' | translate }}</a>
        <a routerLink="/" fragment="features" class="transition hover:text-brand-400">{{ 'nav.features' | translate }}</a>
        <a routerLink="/" fragment="how" class="transition hover:text-brand-400">{{ 'nav.how' | translate }}</a>
        <a routerLink="/" fragment="faq" class="transition hover:text-brand-400">FAQ</a>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <app-language-switcher [dark]="dark()" />
        <a routerLink="/editor" class="btn-primary hidden px-4! py-2! text-sm sm:inline-flex">{{ 'nav.create' | translate }} <lucide-icon [img]="icons.ArrowRight" class="size-4" /></a>
        <button type="button" class="rounded-lg p-2 md:hidden" [class]="dark() ? 'text-white' : 'text-slate-700'" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Menu">
          <lucide-icon [img]="open() ? icons.X : icons.Menu" class="size-5" />
        </button>
      </div>
      @if (open()) {
        <div class="absolute inset-x-4 top-full z-30 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-2xl md:hidden">
          <a routerLink="/templates" class="menu-item" (click)="open.set(false)">{{ 'nav.templates' | translate }}</a>
          <a routerLink="/" fragment="features" class="menu-item" (click)="open.set(false)">{{ 'nav.features' | translate }}</a>
          <a routerLink="/" fragment="how" class="menu-item" (click)="open.set(false)">{{ 'nav.how' | translate }}</a>
          <a routerLink="/" fragment="faq" class="menu-item" (click)="open.set(false)">FAQ</a>
          <a routerLink="/editor" class="btn-primary mt-2 w-full text-sm">{{ 'nav.create' | translate }}</a>
        </div>
      }
    </nav>
  `,
})
export class SiteNav {
  readonly dark = input(true);
  protected readonly open = signal(false);
  protected readonly icons = { ArrowRight, Menu, X };
}
