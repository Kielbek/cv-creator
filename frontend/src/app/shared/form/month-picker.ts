import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UiLanguage } from '../../core/i18n/ui-language';
import { Select, SelectOption } from './select';

/** 'YYYY-MM' as two styled dropdowns (month, year). */
@Component({
  selector: 'ui-month-picker',
  imports: [Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid grid-cols-[1.25fr_1fr] gap-2' },
  template: `
    <ui-select [options]="months()" [value]="month()" [placeholder]="monthLabel()" [ariaLabel]="monthLabel()" [disabled]="disabled()" (valueChange)="setMonth($event)" />
    <ui-select [options]="years" [value]="year()" [placeholder]="yearLabel()" [ariaLabel]="yearLabel()" [disabled]="disabled()" (valueChange)="setYear($event)" />
  `,
})
export class MonthPicker {
  readonly value = input('');
  readonly disabled = input(false);
  readonly monthLabel = input('Month');
  readonly yearLabel = input('Year');
  readonly valueChange = output<string>();

  private readonly ui = inject(UiLanguage);
  protected readonly years: SelectOption[] = Array.from({ length: 70 }, (_, i) => {
    const y = String(new Date().getFullYear() + 1 - i);
    return { value: y, label: y };
  });
  protected readonly year = computed(() => this.value().split('-')[0] ?? '');
  protected readonly month = computed(() => this.value().split('-')[1] ?? '');
  protected readonly months = computed<SelectOption[]>(() => {
    const fmt = new Intl.DateTimeFormat(this.ui.current(), { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => {
      const label = fmt.format(new Date(2020, i, 1));
      return { value: String(i + 1).padStart(2, '0'), label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  });

  protected setMonth(m: string): void {
    const y = this.year() || String(new Date().getFullYear());
    this.valueChange.emit(`${y}-${m}`);
  }

  protected setYear(y: string): void {
    this.valueChange.emit(this.month() ? `${y}-${this.month()}` : y);
  }
}
