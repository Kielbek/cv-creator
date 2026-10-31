import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" class="group inline-flex items-center gap-2.5 text-[13.5px] text-ink-2" (click)="checkedChange.emit(!checked())">
      <span class="relative h-[18px] w-8 shrink-0 rounded-full transition-colors" [class]="checked() ? 'bg-ink' : 'bg-line-2'">
        <span class="absolute top-[2px] left-[2px] size-[14px] rounded-full bg-white shadow-sm transition-transform" [class.translate-x-[14px]]="checked()"></span>
      </span>
      <ng-content />
    </button>
  `,
})
export class Switch {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();
}
