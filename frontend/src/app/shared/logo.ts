import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const BRAND = 'CV Creator';

/** Typographic wordmark. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-baseline gap-1.5 text-ink">
      <span class="serif text-[21px] leading-none font-medium tracking-[-0.02em]">{{ compact() ? 'CV' : brand }}</span>
    </span>
  `,
})
export class Logo {
  readonly compact = input(false);
  protected readonly brand = BRAND;
}
