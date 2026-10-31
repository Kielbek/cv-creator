import { Cv, lines } from '../../core/cv/cv.model';

/** Local, instant CV checklist (no AI): what recruiters and ATS parsers expect to find. */
export interface Check {
  key: string;
  ok: boolean;
  weight: number;
}

export function checks(cv: Cv): Check[] {
  const p = cv.personal;
  const bullets = cv.experience.flatMap((e) => lines(e.description));
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  return [
    { key: 'name', ok: !!(p.firstName && p.lastName), weight: 10 },
    { key: 'headline', ok: !!p.headline, weight: 8 },
    { key: 'contact', ok: !!(p.email && p.phone), weight: 10 },
    { key: 'summary', ok: cv.summary.trim().length >= 150, weight: 12 },
    { key: 'experience', ok: cv.experience.length > 0 && cv.experience.every((e) => e.position && e.company && e.start), weight: 18 },
    { key: 'bullets', ok: bullets.length >= 3 * Math.max(1, Math.min(cv.experience.length, 3)) / 1.5, weight: 12 },
    { key: 'numbers', ok: withNumbers >= 2, weight: 8 },
    { key: 'education', ok: cv.education.length > 0, weight: 8 },
    { key: 'skills', ok: cv.skills.filter((s) => s.name).length >= 5, weight: 9 },
    { key: 'languages', ok: cv.languages.length > 0, weight: 5 },
  ];
}

export function score(list: Check[]): number {
  const total = list.reduce((a, c) => a + c.weight, 0);
  return Math.round((list.filter((c) => c.ok).reduce((a, c) => a + c.weight, 0) / total) * 100);
}
