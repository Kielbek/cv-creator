import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Cv } from '../core/cv/cv.model';
import { sampleCv } from '../core/cv/sample';
import { CvDocument } from './cv-document';

/** First page of a CV (by default the example CV) scaled down to `width` px. */
@Component({
  selector: 'cv-thumb',
  imports: [CvDocument],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-hidden', '[style.width.px]': 'width()', '[style.height.px]': 'width() * 1.4142' },
  template: `<cv-document [cv]="doc()" [pageLimit]="1" [style.zoom]="width() / 794" class="pointer-events-none select-none [&_.cv-page]:shadow-none!" />`,
})
export class CvThumb {
  readonly templateId = input('atlas');
  readonly lang = input('en');
  readonly width = input(220);
  /** Use this CV instead of the example (the template is still applied). */
  readonly cv = input<Cv | null>(null);
  /** Override the template's accent colour. */
  readonly accent = input<string | null>(null);

  protected readonly doc = computed(() => {
    const own = this.cv();
    const base = own ? structuredClone(own) : sampleCv(this.lang(), this.templateId());
    if (own) {
      const fresh = sampleCv('en', this.templateId());
      base.design = { ...fresh.design, showPhoto: own.design.showPhoto, pageSize: 'A4' };
    }
    base.design.pageSize = 'A4';
    if (this.accent()) base.design.accent = this.accent();
    return base;
  });
}
