import { describe, expect, it } from 'vitest';
import { TEMPLATES, defaultLayout, findTemplate, geometry, refitLayout } from './templates';
import { ALL_SECTIONS } from './cv.model';

describe('templates', () => {
  it('every template has a unique id and a default layout matching its skeleton', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      const layout = defaultLayout(t, t.columns);
      expect(layout.length).toBe(t.columns);
      expect(layout.flat().every((s) => ALL_SECTIONS.includes(s))).toBe(true);
    }
  });

  it('sidebar header falls back to a top header with one column', () => {
    expect(geometry({ templateId: 'nova', columns: 1 } as never).header).toBe('left');
    expect(geometry({ templateId: 'nova', columns: null } as never).header).toBe('sidebar');
  });

  it('refit keeps user order, moves sections home and keeps removed sections removed', () => {
    const nova = findTemplate('nova');
    const user = [['skills'], ['experience', 'summary']] as never;
    const one = refitLayout(user, nova, 1);
    expect(one.length).toBe(1);
    expect(one[0]).toEqual(['skills', 'experience', 'summary']);
    expect(one[0]).not.toContain('education');
    const three = refitLayout(user, nova, 3);
    expect(three.length).toBe(3);
    expect(three[1]).toEqual(['experience', 'summary']);
    expect(three[0]).toEqual(['skills']);
  });

  it('same column count keeps the arrangement as is (minus duplicates)', () => {
    const t = findTemplate('atlas');
    expect(refitLayout([['summary', 'summary', 'skills']] as never, t, 1)).toEqual([['summary', 'skills']]);
  });
});
