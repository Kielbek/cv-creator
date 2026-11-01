import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ChevronDown, ChevronRight, Menu, X, LayoutTemplate, Sparkles, ShieldCheck, Target, Languages, FileUp } from 'lucide-angular';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';

type MenuId = 'templates' | 'features' | null;

/** Site header with mega-menus (design: MakeMyCV header). */
@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, TranslatePipe, LucideAngularModule, Logo, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDoc($event)', '(document:keydown.escape)': 'close()' },
  templateUrl: './site-nav.html',
  styleUrl: './site-nav.css',
})
export class SiteNav {
  readonly dark = input(false);
  protected readonly open = signal<MenuId>(null);
  protected readonly mobile = signal(false);
  protected readonly icons = { ChevronDown, ChevronRight, Menu, X, LayoutTemplate, Sparkles, ShieldCheck, Target, Languages, FileUp };
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly popular = ['atlas', 'nova', 'executive', 'harvard'];

  protected toggle(id: MenuId, e: Event): void {
    e.stopPropagation();
    this.open.update((o) => (o === id ? null : id));
  }

  protected close(): void {
    this.open.set(null);
    this.mobile.set(false);
  }

  protected onDoc(e: Event): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.open.set(null);
  }
}
