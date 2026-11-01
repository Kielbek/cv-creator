import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const BRAND = 'cvcreator';

/** Typographic wordmark: "cvcreator." – compact form "cv." */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-baseline text-[20px] leading-none tracking-[-0.04em]" [class]="dark() ? 'text-white' : 'text-[#0b1437]'">
      <span class="font-bold">cv</span>
      @if (!compact()) {
        <span class="font-normal">creator</span>
      }
      <span class="font-bold text-[#3365f5]">.</span>
    </span>
  `,
})
export class Logo {
  readonly compact = input(false);
  readonly dark = input(false);
  protected readonly brand = BRAND;
}
