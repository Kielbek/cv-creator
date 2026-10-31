import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UiLanguage } from '../../core/i18n/ui-language';

/** 'YYYY-MM' as two selects (month, year) in one control – consistent in every browser, unlike <input type="month">. */
@Component({
  selector: 'ui-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="field-group" [class.is-disabled]="disabled()">
      <select class="field-select" [disabled]="disabled()" (change)="setMonth($any($event.target).value)" [attr.aria-label]="monthLabel()">
        <option value="" [selected]="!month()">{{ monthLabel() }}</option>
        @for (m of months(); track m.value) {
          <option [value]="m.value" [selected]="m.value === month()">{{ m.label }}</option>
        }
      </select>
      <span class="field-sep"></span>
      <select class="field-select" [disabled]="disabled()" (change)="setYear($any($event.target).value)" [attr.aria-label]="yearLabel()">
        <option value="" [selected]="!year()">{{ yearLabel() }}</option>
        @for (y of years; track y) {
          <option [value]="y" [selected]="y === year()">{{ y }}</option>
        }
      </select>
    </div>
  `,
})
export class MonthPicker {
  readonly value = input('');
  readonly disabled = input(false);
  readonly monthLabel = input('Month');
  readonly yearLabel = input('Year');
  readonly valueChange = output<string>();

  private readonly ui = inject(UiLanguage);
  protected readonly years = Array.from({ length: 70 }, (_, i) => String(new Date().getFullYear() + 1 - i));
  protected readonly year = computed(() => this.value().split('-')[0] ?? '');
  protected readonly month = computed(() => this.value().split('-')[1] ?? '');
  protected readonly months = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.ui.current(), { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => {
      const label = fmt.format(new Date(2020, i, 1));
      return { value: String(i + 1).padStart(2, '0'), label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  });

  protected setMonth(m: string): void {
    const y = this.year() || String(new Date().getFullYear());
    this.valueChange.emit(m ? `${y}-${m}` : this.year());
  }

  protected setYear(y: string): void {
    this.valueChange.emit(y ? (this.month() ? `${y}-${this.month()}` : y) : '');
  }
}
