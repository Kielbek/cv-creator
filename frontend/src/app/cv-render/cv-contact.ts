import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Cv } from '../core/cv/cv.model';

const ICONS: Record<string, string> = {
  email: 'M4 6h16v12H4z M4 7l8 6 8-6',
  phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z',
  location: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  website: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z',
  linkedin: 'M4 4h16v16H4z M8 10v6 M8 7.5v.01 M12 16v-6 M12 12.5c0-1.5 1-2.5 2.3-2.5S16 11 16 12.5V16',
  github: 'M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
};

/** Contact details. Plain text next to small icons: icons are decoration, ATS parsers read the text. */
@Component({
  selector: 'cv-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="cv-contact" [class.cv-contact-inline]="inline()">
      @for (item of items(); track item.type) {
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icon(item.type)" /></svg>
          <span>{{ item.value }}</span>
        </li>
      }
    </ul>
  `,
})
export class CvContactList {
  readonly cv = input.required<Cv>();
  readonly inline = input(false);

  protected readonly items = computed(() => {
    const p = this.cv().personal;
    return (['email', 'phone', 'location', 'website', 'linkedin', 'github'] as const)
      .map((type) => ({ type, value: p[type] }))
      .filter((i) => !!i.value);
  });

  protected icon(type: string): string {
    return ICONS[type];
  }
}
