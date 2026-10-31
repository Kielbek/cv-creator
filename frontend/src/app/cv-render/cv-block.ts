import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Cv, lines } from '../core/cv/cv.model';
import { Geometry } from '../core/cv/templates';
import { cvLabels, formatMonth, formatRange, languageLevel } from '../core/cv/cv-labels';
import { Block } from './blocks';
import { CvHeader } from './cv-header';
import { CvContactList } from './cv-contact';

/** Renders one block. All visual differences between templates come from data-attributes + cv.css. */
@Component({
  selector: 'cv-block',
  imports: [CvHeader, CvContactList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let b = block();
    @let c = cv();
    @if (b.kind === 'first' || b.kind === 'whole') {
      <h2 class="cv-h"><span>{{ labels().sections[b.section!] }}</span></h2>
    }
    @switch (b.kind === 'header' ? 'header' : b.kind === 'consent' ? 'consent' : b.section) {
      @case ('header') {
        <cv-header [cv]="c" [g]="g()" mode="sidebar" />
      }
      @case ('consent') {
        <p class="cv-consent">{{ c.consent }}</p>
      }
      @case ('summary') {
        <p class="cv-text">{{ c.summary }}</p>
      }
      @case ('interests') {
        <p class="cv-text">{{ c.interests }}</p>
      }
      @case ('contact') {
        <cv-contact [cv]="c" />
      }
      @case ('experience') {
        @let e = c.experience[b.index];
        <article class="cv-entry">
          <div class="cv-entry-top">
            <h3 class="cv-entry-title">{{ e.position }}</h3>
            <span class="cv-date">{{ range(e.start, e.end, e.current) }}</span>
          </div>
          <p class="cv-entry-sub">{{ join(e.company, e.location) }}</p>
          @if (bullets(e.description).length) {
            <ul class="cv-bullets">
              @for (l of bullets(e.description); track $index) {
                <li>{{ l }}</li>
              }
            </ul>
          }
        </article>
      }
      @case ('education') {
        @let e = c.education[b.index];
        <article class="cv-entry">
          <div class="cv-entry-top">
            <h3 class="cv-entry-title">{{ e.degree }}</h3>
            <span class="cv-date">{{ range(e.start, e.end, e.current) }}</span>
          </div>
          <p class="cv-entry-sub">{{ join(e.school, e.location) }}</p>
          @if (bullets(e.description).length) {
            <ul class="cv-bullets">
              @for (l of bullets(e.description); track $index) {
                <li>{{ l }}</li>
              }
            </ul>
          }
        </article>
      }
      @case ('projects') {
        @let p = c.projects[b.index];
        <article class="cv-entry">
          <div class="cv-entry-top">
            <h3 class="cv-entry-title">{{ p.name }}</h3>
            @if (p.link) {
              <span class="cv-date">{{ p.link }}</span>
            }
          </div>
          @if (bullets(p.description).length) {
            <ul class="cv-bullets">
              @for (l of bullets(p.description); track $index) {
                <li>{{ l }}</li>
              }
            </ul>
          }
        </article>
      }
      @case ('certificates') {
        @let p = c.certificates[b.index];
        <article class="cv-entry cv-entry-compact">
          <div class="cv-entry-top">
            <h3 class="cv-entry-title">{{ p.name }}</h3>
            <span class="cv-date">{{ month(p.date) }}</span>
          </div>
          @if (p.issuer) {
            <p class="cv-entry-sub">{{ p.issuer }}</p>
          }
        </article>
      }
      @case ('skills') {
        <ul class="cv-skills" [attr.data-style]="g().template.skills">
          @for (s of c.skills; track s.id) {
            @if (s.name) {
              <li>
                <span class="cv-skill-name">{{ s.name }}</span>
                @if (s.level > 0) {
                  <span class="cv-level" [attr.aria-label]="s.level + '/5'">
                    <span class="cv-level-fill" [style.width.%]="s.level * 20"></span>
                    @for (d of dots; track d) {
                      <i [class.on]="d <= s.level"></i>
                    }
                  </span>
                }
              </li>
            }
          }
        </ul>
      }
      @case ('languages') {
        <ul class="cv-langs">
          @for (l of c.languages; track l.id) {
            @if (l.name) {
              <li>
                <span>{{ l.name }}</span><span class="cv-lang-level">{{ level(l.level) }}</span>
              </li>
            }
          }
        </ul>
      }
    }
  `,
})
export class CvBlock {
  readonly block = input.required<Block>();
  readonly cv = input.required<Cv>();
  readonly g = input.required<Geometry>();

  protected readonly labels = computed(() => cvLabels(this.cv().language));
  protected readonly dots = [1, 2, 3, 4, 5];

  protected range(start: string, end: string, current: boolean): string {
    return formatRange(start, end, current, this.cv().language);
  }

  protected month(v: string): string {
    return formatMonth(v, this.cv().language);
  }

  protected level(v: string): string {
    return languageLevel(v, this.cv().language);
  }

  protected bullets(text: string): string[] {
    return lines(text);
  }

  protected join(...parts: string[]): string {
    return parts.filter(Boolean).join(' · ');
  }
}
