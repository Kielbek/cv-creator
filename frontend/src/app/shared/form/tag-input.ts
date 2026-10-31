import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

/** Chips + free text: Enter or comma adds, Backspace on empty input removes the last chip. */
@Component({
  selector: 'ui-tag-input',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tag-box" (click)="focus()">
      @for (t of tags(); track t.id) {
        <span class="tag">
          {{ t.name }}
          <button type="button" class="tag-x" (click)="$event.stopPropagation(); remove.emit(t.id)" [attr.aria-label]="removeLabel() + ' ' + t.name">
            <lucide-icon [img]="x" class="size-3" />
          </button>
        </span>
      }
      <input #field class="min-w-40 flex-1 bg-transparent py-1 text-[14px] outline-none placeholder:text-faint" [placeholder]="placeholder()" (keydown)="onKey($event)" (blur)="commit()" [attr.aria-label]="placeholder()" />
    </div>
  `,
})
export class TagInput {
  readonly tags = input<{ id: string; name: string }[]>([]);
  readonly placeholder = input('');
  readonly removeLabel = input('Remove');
  readonly add = output<string>();
  readonly remove = output<string>();
  protected readonly x = X;
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected focus(): void {
    this.field().nativeElement.focus();
  }

  protected onKey(e: KeyboardEvent): void {
    const el = this.field().nativeElement;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.commit();
    } else if (e.key === 'Backspace' && !el.value && this.tags().length) {
      this.remove.emit(this.tags()[this.tags().length - 1].id);
    }
  }

  protected commit(): void {
    const el = this.field().nativeElement;
    for (const part of el.value.split(',')) {
      const v = part.trim();
      if (v && !this.tags().some((t) => t.name.toLowerCase() === v.toLowerCase())) this.add.emit(v);
    }
    el.value = '';
  }
}
