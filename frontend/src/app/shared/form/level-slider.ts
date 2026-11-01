import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const;

/** Language level as a slider with CEFR stops (A1 … C2, native). */
@Component({
  selector: 'ui-level-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="lvl" [style.--p.%]="(index() / (stops.length - 1)) * 100">
      <input
        type="range"
        min="0"
        [max]="stops.length - 1"
        step="1"
        [value]="index()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-valuetext]="labels()[index()]"
        (input)="valueChange.emit(stops[+$any($event.target).value])"
      />
      <div class="lvl-ticks">
        @for (s of stops; track s; let i = $index) {
          <button type="button" class="lvl-tick" [class.is-on]="i <= index()" [class.is-current]="i === index()" (click)="valueChange.emit(s)" tabindex="-1">{{ labels()[i] }}</button>
        }
      </div>
    </div>
  `,
})
export class LevelSlider {
  readonly value = input('B2');
  readonly nativeLabel = input('Native');
  readonly ariaLabel = input<string | null>(null);
  readonly valueChange = output<string>();
  protected readonly stops = CEFR;
  protected readonly index = computed(() => Math.max(0, CEFR.indexOf(this.value() as (typeof CEFR)[number])));
  protected readonly labels = computed(() => CEFR.map((s) => (s === 'native' ? this.nativeLabel() : s)));
}
