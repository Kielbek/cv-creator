import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const BRAND = 'CV Creator';

/** Mark + wordmark. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2.5" [class]="dark() ? 'text-white' : 'text-ink'">
      <svg viewBox="0 0 28 28" class="size-7 shrink-0" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#2563eb" />
        <path d="M9 7.5h7l3.5 3.5v9.5H9z" fill="#fff" />
        <path d="M11.5 14h5M11.5 17h3.5" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      @if (!compact()) {
        <span class="text-[17px] font-semibold tracking-[-0.03em]">{{ brand }}</span>
      }
    </span>
  `,
})
export class Logo {
  readonly compact = input(false);
  readonly dark = input(false);
  protected readonly brand = BRAND;
}
