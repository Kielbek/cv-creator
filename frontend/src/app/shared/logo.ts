import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const BRAND = 'Makemycv';

/** Logo from the MakeMyCV design: tilted outline mark + wordmark (compact = mark only). */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2 whitespace-nowrap text-[19px] tracking-[-0.03em]" [class]="dark() ? 'text-white' : 'text-[#111218]'">
      <span class="inline-block size-[17px] rotate-[5deg] rounded-[4px] border-4" [class]="dark() ? 'border-white' : 'border-[#111]'"></span>
      @if (!compact()) {
        <span>{{ brand }}</span>
      }
    </span>
  `,
})
export class Logo {
  readonly compact = input(false);
  readonly dark = input(false);
  protected readonly brand = BRAND;
}
