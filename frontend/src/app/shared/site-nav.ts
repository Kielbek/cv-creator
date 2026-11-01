import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UI_LANGUAGES, UiLanguage } from '../core/i18n/ui-language';

type MenuId = 'templates' | 'examples' | 'cover' | 'resources' | 'lang' | null;

/** Site header – 1:1 port of the MakeMyCV design (markup + styles in styles/makemycv.css). */
@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mmcv block', '(document:click)': 'onDoc($event)', '(document:keydown.escape)': 'close()' },
  templateUrl: './site-nav.html',
  styles: [':host{position:relative;z-index:30;background:transparent} .lang-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:40;min-width:170px;background:#fff;border:1px solid #e6eaf1;border-radius:10px;box-shadow:0 14px 28px rgba(22,34,61,.12);padding:6px} .lang-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:0;background:transparent;border-radius:7px;font-size:14px;color:#252b3a;text-align:left} .lang-menu button:hover{background:#f7f8ff} .lang-wrap{position:relative}'],
})
export class SiteNav {
  readonly dark = input(false);
  protected readonly ui = inject(UiLanguage);
  protected readonly open = signal<MenuId>(null);
  protected readonly mobile = signal(false);
  protected readonly langs = UI_LANGUAGES;
  protected readonly current = computed(() => UI_LANGUAGES.find((l) => l.code === this.ui.current()) ?? UI_LANGUAGES[1]);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected toggle(id: MenuId, e: Event): void {
    e.stopPropagation();
    this.open.update((o) => (o === id ? null : id));
  }

  protected pickLang(code: string): void {
    this.ui.use(code);
    this.open.set(null);
  }

  protected close(): void {
    this.open.set(null);
    this.mobile.set(false);
  }

  protected onDoc(e: Event): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.open.set(null);
  }
}
