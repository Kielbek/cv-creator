import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Cv } from '../core/cv/cv.model';
import { Geometry } from '../core/cv/templates';
import { CvContactList } from './cv-contact';

/** Name, headline, photo and (when 'contact' is not placed as a section) the contact line. */
@Component({
  selector: 'cv-header',
  imports: [CvContactList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cv-header" [attr.data-mode]="mode()">
      @if (photo()) {
        <img class="cv-photo" [src]="photo()" alt="" [attr.data-shape]="g().template.photo" />
      }
      <div class="cv-header-text">
        <h1 class="cv-name">
          <span>{{ cv().personal.firstName }}</span> <span class="cv-name-last">{{ cv().personal.lastName }}</span>
        </h1>
        @if (cv().personal.headline) {
          <p class="cv-headline">{{ cv().personal.headline }}</p>
        }
        @if (showContact()) {
          <cv-contact [cv]="cv()" [inline]="mode() === 'top'" />
        }
      </div>
    </header>
  `,
})
export class CvHeader {
  readonly cv = input.required<Cv>();
  readonly g = input.required<Geometry>();
  readonly mode = input<'top' | 'sidebar'>('top');

  protected readonly photo = computed(() => (this.cv().design.showPhoto ? this.cv().personal.photo : ''));
  protected readonly showContact = computed(() => !this.cv().design.layout.flat().includes('contact'));
}
