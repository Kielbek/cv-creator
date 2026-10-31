import { Cv, uid } from './cv.model';
import { ImportedCv } from '../ai/ai.service';

const month = (v: string | undefined) => (v && /^\d{4}(-\d{2})?$/.test(v.trim()) ? v.trim() : '');
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'];

/** Writes a CV read by the AI into an (empty) CV document. Design, country and consent stay as they are. */
export function applyImported(cv: Cv, data: ImportedCv, supportedLanguages: string[]): void {
  if (supportedLanguages.includes(data.language)) cv.language = data.language;
  const p = data.personal ?? {};
  for (const k of ['firstName', 'lastName', 'headline', 'email', 'phone', 'location', 'website', 'linkedin', 'github'] as const) {
    cv.personal[k] = str(p[k]);
  }
  cv.summary = str(data.summary);
  cv.interests = str(data.interests);
  cv.experience = (data.experience ?? []).map((e) => ({
    id: uid(),
    position: str(e.position),
    company: str(e.company),
    location: str(e.location),
    start: month(e.start),
    end: e.current ? '' : month(e.end),
    current: !!e.current,
    description: str(e.description),
  }));
  cv.education = (data.education ?? []).map((e) => ({
    id: uid(),
    degree: str(e.degree),
    school: str(e.school),
    location: str(e.location),
    start: month(e.start),
    end: e.current ? '' : month(e.end),
    current: !!e.current,
    description: str(e.description),
  }));
  cv.skills = (data.skills ?? []).map(str).filter(Boolean).map((name) => ({ id: uid(), name, level: 0 }));
  cv.languages = (data.languages ?? []).map((l) => {
    const level = str(l.level);
    return { id: uid(), name: str(l.name), level: LEVELS.includes(level) ? level : level.toLowerCase() === 'native' ? 'native' : 'B2' };
  });
  cv.projects = (data.projects ?? []).map((x) => ({ id: uid(), name: str(x.name), link: str(x.link), description: str(x.description) }));
  cv.certificates = (data.certificates ?? []).map((x) => ({ id: uid(), name: str(x.name), issuer: str(x.issuer), date: month(x.date) }));
}
