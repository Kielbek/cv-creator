/**
 * The CV document. Everything the user types lives here and is stored in the browser (no account needed).
 * Dates are 'YYYY-MM' strings; texts with several lines (descriptions) are rendered as bullet lists.
 */
export type SectionId =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certificates'
  | 'interests';

export const ALL_SECTIONS: readonly SectionId[] = [
  'contact',
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'certificates',
  'interests',
];

export interface Personal {
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  /** data: URL (resized in the browser), never uploaded anywhere */
  photo: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  /** 0 = no level shown, 1-5 */
  level: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  /** CEFR (A1-C2) or 'native' */
  level: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export type FontId = 'inter' | 'lora' | 'system' | 'georgia';
export type PageSize = 'A4' | 'LETTER';

export interface CvDesign {
  templateId: string;
  /** section ids per column, in reading order; a section missing here is not printed ('contact' then goes to the header) */
  layout: SectionId[][];
  accent: string | null;
  font: FontId | null;
  /** 0.85 - 1.15 */
  fontScale: number;
  showPhoto: boolean;
  pageSize: PageSize;
}

export interface Cv {
  version: 1;
  /** language the CV is written in (headings, dates) */
  language: string;
  /** country the CV is aimed at (conventions, page size, consent clause) */
  country: string;
  personal: Personal;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  interests: string;
  /** data-processing clause (required by many employers in PL) */
  consent: string;
  design: CvDesign;
  updatedAt: string;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyPersonal(): Personal {
  return { firstName: '', lastName: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', photo: '' };
}

export const newExperience = (): ExperienceItem => ({ id: uid(), position: '', company: '', location: '', start: '', end: '', current: false, description: '' });
export const newEducation = (): EducationItem => ({ id: uid(), degree: '', school: '', location: '', start: '', end: '', current: false, description: '' });
export const newSkill = (): SkillItem => ({ id: uid(), name: '', level: 0 });
export const newLanguage = (): LanguageItem => ({ id: uid(), name: '', level: 'B2' });
export const newProject = (): ProjectItem => ({ id: uid(), name: '', link: '', description: '' });
export const newCertificate = (): CertificateItem => ({ id: uid(), name: '', issuer: '', date: '' });

/** An entry nobody has typed into yet (a fresh draft) – never printed. */
export function isBlank(item: object): boolean {
  return Object.entries(item).every(([k, v]) => k === 'id' || k === 'current' || k === 'level' || v === '' || v == null || v === false);
}

/** Does the section have anything to print? Empty sections are skipped by the renderer. */
export function hasContent(cv: Cv, s: SectionId): boolean {
  switch (s) {
    case 'contact': {
      const p = cv.personal;
      return !!(p.email || p.phone || p.location || p.website || p.linkedin || p.github);
    }
    case 'summary':
      return !!cv.summary.trim();
    case 'interests':
      return !!cv.interests.trim();
    default:
      return (cv[s] as object[]).some((i) => !isBlank(i));
  }
}

export function lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*–]\s*/, '').trim())
    .filter(Boolean);
}

/** Required fields of the header step → i18n key of the error (empty object = valid). */
export type HeaderField = 'firstName' | 'lastName' | 'email' | 'phone';
export function headerErrors(cv: Cv): Partial<Record<HeaderField, string>> {
  const p = cv.personal;
  const e: Partial<Record<HeaderField, string>> = {};
  if (!p.firstName.trim()) e.firstName = 'required';
  if (!p.lastName.trim()) e.lastName = 'required';
  if (!p.email.trim()) e.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) e.email = 'email';
  if (!p.phone.trim()) e.phone = 'required';
  else if (p.phone.replace(/\D/g, '').length < 6) e.phone = 'phone';
  return e;
}
