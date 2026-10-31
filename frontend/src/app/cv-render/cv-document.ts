import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  output,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Cv } from '../core/cv/cv.model';
import { geometry } from '../core/cv/templates';
import { paginate } from '../core/cv/paginate';
import { Block, PAD_Y, PAGE, buildColumns } from './blocks';
import { CvBlock } from './cv-block';
import { CvHeader } from './cv-header';

const FONTS: Record<string, string> = {
  inter: "'Inter Variable', 'Inter', system-ui, sans-serif",
  lora: "'Lora', Georgia, serif",
  georgia: "Georgia, 'Times New Roman', serif",
  system: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
};

/**
 * A CV rendered as real A4/Letter pages.
 *
 * How pagination works: all blocks are first rendered into an invisible, unconstrained "measuring" page with the
 * exact same widths and styles. Their heights are read after every render and fed to {@link paginate}, which
 * decides which blocks go on which page. The visible pages render the same block components, so what you measure
 * is what you get - also in the printed PDF.
 */
@Component({
  selector: 'cv-document',
  imports: [CvBlock, CvHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cv-document' },
  template: `
    @let c = cv();
    @let geo = g();
    <!-- measuring stage: same markup, no fixed height, off-screen -->
    <div class="cv-measure" aria-hidden="true" #measure>
      <div class="cv-page cv-page-measure" [style]="vars()" [attr.data-header]="geo.header" [attr.data-heading]="geo.template.heading" [attr.data-template]="geo.template.id">
        @if (topHeader()) {
          <div data-header-box><cv-header [cv]="c" [g]="geo" /></div>
        }
        <div class="cv-cols" [style.grid-template-columns]="gridColumns()">
          @for (col of columns(); track $index) {
            <div class="cv-col" [attr.data-theme]="geo.themes[$index]">
              @for (b of col; track b.key) {
                <div class="cv-block" [attr.data-key]="b.key" [attr.data-kind]="b.kind"><cv-block [block]="b" [cv]="c" [g]="geo" /></div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    @for (page of visiblePages(); track $index; let first = $first) {
      <section class="cv-page" [style]="vars()" [attr.data-header]="geo.header" [attr.data-heading]="geo.template.heading" [attr.data-template]="geo.template.id" [attr.aria-label]="'Page ' + ($index + 1)">
        @if (first && topHeader()) {
          <cv-header [cv]="c" [g]="geo" />
        }
        <div class="cv-cols" [style.grid-template-columns]="gridColumns()">
          @for (col of page; track $index) {
            <div class="cv-col" [attr.data-theme]="geo.themes[$index]">
              @for (key of col; track key) {
                @let b = blockMap().get(key);
                @if (b) {
                  <div class="cv-block" [attr.data-kind]="b.kind"><cv-block [block]="b" [cv]="c" [g]="geo" /></div>
                }
              }
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class CvDocument {
  readonly cv = input.required<Cv>();
  /** Render only the first N pages (thumbnails). */
  readonly pageLimit = input<number | null>(null);

  /** Emits the number of pages whenever it changes. */
  readonly pageCount = output<number>();

  private readonly measureRef = viewChild.required<ElementRef<HTMLElement>>('measure');
  private readonly heights = signal<Record<string, number>>({});
  private readonly headerHeight = signal(0);

  protected readonly g = computed(() => geometry(this.cv().design));
  protected readonly columns = computed(() => buildColumns(this.cv(), this.g()));
  protected readonly topHeader = computed(() => this.g().header !== 'sidebar');
  protected readonly blockMap = computed(() => new Map<string, Block>(this.columns().flat().map((b) => [b.key, b])));
  protected readonly page = computed(() => PAGE[this.cv().design.pageSize] ?? PAGE.A4);
  protected readonly gridColumns = computed(() => this.g().widths.map((w) => `${w}fr`).join(' '));

  protected readonly vars = computed(() => {
    const g = this.g();
    const p = this.page();
    return {
      '--cv-accent': g.accent,
      '--cv-font': FONTS[g.font] ?? FONTS['inter'],
      '--cv-scale': String(this.cv().design.fontScale || 1),
      '--cv-page-w': `${p.width}px`,
      '--cv-page-h': `${p.height}px`,
      '--cv-pad-y': `${PAD_Y}px`,
    };
  });

  readonly pages = computed(() => {
    const h = this.heights();
    const p = this.page();
    const capacity = p.height - 2 * PAD_Y;
    const header = this.topHeader() ? this.headerHeight() : 0;
    const cols = this.columns().map((col) => col.map((b) => ({ key: b.key, height: h[b.key] ?? 0 })));
    return paginate(cols, cols.map(() => capacity - header), capacity);
  });

  protected readonly visiblePages = computed(() => {
    const limit = this.pageLimit();
    return limit ? this.pages().slice(0, limit) : this.pages();
  });

  constructor() {
    effect(() => this.pageCount.emit(this.pages().length));
    afterRenderEffect({
      read: () => {
        // re-measure whenever the content or design changes
        this.columns();
        this.vars();
        this.measure();
      },
    });
    // fonts and photos load asynchronously and change heights without a new render
    const observer = new ResizeObserver(() => this.measure());
    afterRenderEffect(() => {
      observer.disconnect();
      const root = this.measureRef().nativeElement;
      root.querySelectorAll<HTMLElement>('.cv-block, [data-header-box]').forEach((el) => observer.observe(el));
    });
    document.fonts?.ready.then(() => this.measure());
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  private measure(): void {
    const root = this.measureRef().nativeElement;
    const next: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>('[data-key]').forEach((el) => {
      next[el.dataset['key']!] = Math.ceil(el.getBoundingClientRect().height * 10) / 10;
    });
    const prev = this.heights();
    const keys = Object.keys(next);
    if (keys.length !== Object.keys(prev).length || keys.some((k) => prev[k] !== next[k])) {
      this.heights.set(next);
    }
    const header = root.querySelector<HTMLElement>('[data-header-box]');
    const hh = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    if (hh !== this.headerHeight()) this.headerHeight.set(hh);
  }
}
