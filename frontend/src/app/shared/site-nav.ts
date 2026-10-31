import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, Logo, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="z-30" [class]="dark() ? 'relative' : 'sticky top-0 border-b border-line/70 bg-white/85 backdrop-blur'">
      <nav class="relative mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-8">
        <a routerLink="/" aria-label="Home"><app-logo [dark]="dark()" /></a>
        <div class="hidden items-center gap-7 text-[14px] md:flex" [class]="dark() ? 'text-white/70' : 'text-muted'">
          <a routerLink="/templates" class="transition" [class]="dark() ? 'hover:text-white' : 'hover:text-ink'">{{ 'nav.templates' | translate }}</a>
          <a routerLink="/" fragment="features" class="transition" [class]="dark() ? 'hover:text-white' : 'hover:text-ink'">{{ 'nav.features' | translate }}</a>
          <a routerLink="/" fragment="faq" class="transition" [class]="dark() ? 'hover:text-white' : 'hover:text-ink'">FAQ</a>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <app-language-switcher [dark]="dark()" />
          <a routerLink="/start" class="btn-primary btn-sm hidden sm:inline-flex">{{ 'nav.create' | translate }}</a>
          <button type="button" class="icon-btn max-md:inline-flex! md:hidden!" [class.text-white!]="dark()" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Menu">
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
  readonly dark = input(false);
  protected readonly open = signal(false);
  protected readonly icons = { Menu, X };
}
