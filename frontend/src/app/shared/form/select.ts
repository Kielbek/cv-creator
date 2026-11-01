import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Check, ChevronDown, Search } from 'lucide-angular';

export interface SelectOption {
  value: string;
  label: string;
  /** optional flag code (public/flags/<code>.svg) */
  flag?: string;
}

/**
 * Styled dropdown replacing the native <select>: keyboard support (arrows, Enter, Esc, type-ahead),
 * closes on outside click, optional search for long lists.
 */
@Component({
  selector: 'ui-select',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block', '(document:mousedown)': 'onOutside($event)' },
  template: `
    <button
      #trigger
      type="button"
      class="sel-trigger"
      [class.is-open]="open()"
      [class.is-empty]="!selected()"
      [disabled]="disabled()"
      [attr.id]="inputId()"
      [attr.aria-label]="ariaLabel()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
      (keydown)="onKey($event)"
    >
      @if (selected()?.flag) {
        <img class="flag" [src]="'flags/' + selected()!.flag + '.svg'" alt="" />
      }
      <span class="min-w-0 flex-1 truncate text-left">{{ selected()?.label ?? placeholder() }}</span>
      <lucide-icon [img]="icons.ChevronDown" class="size-4 shrink-0 text-[#8a93a8] transition" [class.rotate-180]="open()" />
    </button>
    @if (open()) {
      <div class="sel-panel" role="listbox">
        @if (searchable()) {
          <div class="sel-search">
            <lucide-icon [img]="icons.Search" class="size-4 text-[#8a93a8]" />
            <input #search class="min-w-0 flex-1 bg-transparent text-[14px] outline-none" [placeholder]="searchPlaceholder()" (input)="query.set($any($event.target).value)" (keydown)="onKey($event)" />
          </div>
        }
        <div class="sel-list">
          @for (o of filtered(); track o.value; let i = $index) {
            <button
              type="button"
              role="option"
              class="sel-option"
              [class.is-active]="i === active()"
              [attr.aria-selected]="o.value === value()"
              (mouseenter)="active.set(i)"
              (click)="pick(o)"
            >
              @if (o.flag) {
                <img class="flag" [src]="'flags/' + o.flag + '.svg'" alt="" />
              }
              <span class="min-w-0 flex-1 truncate">{{ o.label }}</span>
              @if (o.value === value()) {
                <lucide-icon [img]="icons.Check" class="size-4 text-[#3365f5]" />
              }
            </button>
          } @empty {
            <p class="px-3 py-2 text-[13px] text-[#8a93a8]">—</p>
          }
        </div>
      </div>
    }
  `,
})
export class Select {
  readonly options = input<SelectOption[]>([]);
  readonly value = input<string>('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly inputId = input<string | null>(null);
  readonly searchPlaceholder = input('');
  readonly valueChange = output<string>();

  protected readonly icons = { Check, ChevronDown, Search };
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  protected readonly query = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
  private typed = '';
  private typedAt = 0;

  protected readonly searchable = computed(() => this.options().length > 14);
  protected readonly selected = computed(() => this.options().find((o) => o.value === this.value()));
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.options().filter((o) => o.label.toLowerCase().includes(q)) : this.options();
  });

  protected toggle(): void {
    this.open() ? this.close() : this.show();
  }

  private show(): void {
    this.query.set('');
    this.active.set(Math.max(0, this.options().findIndex((o) => o.value === this.value())));
    this.open.set(true);
    setTimeout(() => {
      this.search()?.nativeElement.focus();
      this.host.nativeElement.querySelector('.sel-option.is-active')?.scrollIntoView({ block: 'nearest' });
    });
  }

  private close(): void {
    this.open.set(false);
  }

  protected pick(o: SelectOption): void {
    this.valueChange.emit(o.value);
    this.close();
    this.trigger()?.nativeElement.focus();
  }

  protected onOutside(e: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.close();
  }

  protected onKey(e: KeyboardEvent): void {
    const list = this.filtered();
    if (e.key === 'Escape') {
      this.close();
      this.trigger()?.nativeElement.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.open()) return this.show();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      this.active.set(Math.min(list.length - 1, Math.max(0, this.active() + d)));
      setTimeout(() => this.host.nativeElement.querySelector('.sel-option.is-active')?.scrollIntoView({ block: 'nearest' }));
    } else if (e.key === 'Enter' && this.open()) {
      e.preventDefault();
      const o = list[this.active()];
      if (o) this.pick(o);
    } else if (!this.searchable() && e.key.length === 1 && /\S/.test(e.key)) {
      // type-ahead
      const now = Date.now();
      this.typed = now - this.typedAt > 700 ? e.key.toLowerCase() : this.typed + e.key.toLowerCase();
      this.typedAt = now;
      const i = list.findIndex((o) => o.label.toLowerCase().startsWith(this.typed));
      if (i >= 0) {
        if (!this.open()) this.show();
        this.active.set(i);
        setTimeout(() => this.host.nativeElement.querySelector('.sel-option.is-active')?.scrollIntoView({ block: 'nearest' }));
      }
    }
  }
}
