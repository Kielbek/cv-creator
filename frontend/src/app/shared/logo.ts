import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const BRAND = 'CV Creator';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2 font-bold tracking-tight" [class]="dark() ? 'text-white' : 'text-slate-900'">
      <svg viewBox="0 0 32 32" class="size-8 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d7dff" /><stop offset="1" stop-color="#a855f7" /></linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#lg)" />
        <path d="M10 8.5h8.5l4 4V23.5H10z" fill="#fff" opacity=".95" />
        <path d="M13 16h6.5M13 19.5h4.5" stroke="#6d5dfc" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      @if (!compact()) {
        <span class="text-lg">{{ brand }}</span>
      } @else {
        <span class="hidden text-base sm:inline">{{ brand }}</span>
      }
    </span>
  `,
})
export class Logo {
  readonly dark = input(true);
  readonly compact = input(false);
  protected readonly brand = BRAND;
}
