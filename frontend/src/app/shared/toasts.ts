import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface Toast {
  id: number;
  key: string;
  kind: 'info' | 'warn' | 'error';
}

@Injectable({ providedIn: 'root' })
export class Toasts {
  readonly items = signal<Toast[]>([]);
  private next = 1;

  show(key: string, kind: Toast['kind'] = 'info'): void {
    const id = this.next++;
    this.items.update((t) => [...t, { id, key, kind }]);
    setTimeout(() => this.items.update((t) => t.filter((x) => x.id !== id)), 4500);
  }
}

@Component({
  selector: 'app-toasts',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="no-print pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
      @for (t of toasts.items(); track t.id) {
        <div
          class="pointer-events-auto rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl"
          [class]="t.kind === 'error' ? 'bg-red-600 text-white' : t.kind === 'warn' ? 'bg-amber-500 text-white' : 'bg-navy text-white'"
        >
          {{ t.key | translate }}
        </div>
      }
    </div>
  `,
})
export class ToastsHost {
  protected readonly toasts = inject(Toasts);
}
