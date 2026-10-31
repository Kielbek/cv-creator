import { SectionId } from './cv.model';

/**
 * Headings printed ON the CV, in the language the CV is written in (independent of the app's UI language:
 * a Polish user may write an English CV for a UK employer).
 */
export interface CvLabels {
  sections: Record<SectionId, string>;
  present: string;
  native: string;
}

const L: Record<string, CvLabels> = {
  en: { sections: { contact: 'Contact', summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', languages: 'Languages', projects: 'Projects', certificates: 'Certifications', interests: 'Interests' }, present: 'Present', native: 'Native' },
  pl: { sections: { contact: 'Kontakt', summary: 'Profil', experience: 'Doświadczenie zawodowe', education: 'Wykształcenie', skills: 'Umiejętności', languages: 'Języki', projects: 'Projekty', certificates: 'Certyfikaty', interests: 'Zainteresowania' }, present: 'obecnie', native: 'ojczysty' },
  de: { sections: { contact: 'Kontakt', summary: 'Profil', experience: 'Berufserfahrung', education: 'Ausbildung', skills: 'Kenntnisse', languages: 'Sprachen', projects: 'Projekte', certificates: 'Zertifikate', interests: 'Interessen' }, present: 'heute', native: 'Muttersprache' },
  fr: { sections: { contact: 'Contact', summary: 'Profil', experience: 'Expérience professionnelle', education: 'Formation', skills: 'Compétences', languages: 'Langues', projects: 'Projets', certificates: 'Certifications', interests: "Centres d'intérêt" }, present: "aujourd'hui", native: 'langue maternelle' },
  es: { sections: { contact: 'Contacto', summary: 'Perfil', experience: 'Experiencia profesional', education: 'Formación', skills: 'Habilidades', languages: 'Idiomas', projects: 'Proyectos', certificates: 'Certificaciones', interests: 'Intereses' }, present: 'actualidad', native: 'nativo' },
  it: { sections: { contact: 'Contatti', summary: 'Profilo', experience: 'Esperienza professionale', education: 'Istruzione', skills: 'Competenze', languages: 'Lingue', projects: 'Progetti', certificates: 'Certificazioni', interests: 'Interessi' }, present: 'oggi', native: 'madrelingua' },
  pt: { sections: { contact: 'Contacto', summary: 'Perfil', experience: 'Experiência profissional', education: 'Formação', skills: 'Competências', languages: 'Idiomas', projects: 'Projetos', certificates: 'Certificações', interests: 'Interesses' }, present: 'atual', native: 'nativo' },
  nl: { sections: { contact: 'Contact', summary: 'Profiel', experience: 'Werkervaring', education: 'Opleiding', skills: 'Vaardigheden', languages: 'Talen', projects: 'Projecten', certificates: 'Certificaten', interests: 'Interesses' }, present: 'heden', native: 'moedertaal' },
  cs: { sections: { contact: 'Kontakt', summary: 'Profil', experience: 'Pracovní zkušenosti', education: 'Vzdělání', skills: 'Dovednosti', languages: 'Jazyky', projects: 'Projekty', certificates: 'Certifikáty', interests: 'Zájmy' }, present: 'současnost', native: 'rodilý mluvčí' },
  uk: { sections: { contact: 'Контакти', summary: 'Профіль', experience: 'Досвід роботи', education: 'Освіта', skills: 'Навички', languages: 'Мови', projects: 'Проєкти', certificates: 'Сертифікати', interests: 'Інтереси' }, present: 'дотепер', native: 'рідна' },
};

export const CV_LANGUAGES = Object.keys(L);

export function cvLabels(lang: string): CvLabels {
  return L[lang] ?? L['en'];
}

/** 'YYYY-MM' → localized short date, e.g. "03/2021" or "Mar 2021" depending on the language. */
export function formatMonth(value: string, lang: string): string {
  if (!value) return '';
  const [y, m] = value.split('-').map(Number);
  if (!y) return value;
  if (!m) return String(y);
  const numeric = ['pl', 'de', 'cs', 'uk', 'nl', 'it', 'pt', 'es', 'fr'].includes(lang);
  if (numeric) return `${String(m).padStart(2, '0')}/${y}`;
  return new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }).format(new Date(y, m - 1, 1));
}

export function formatRange(start: string, end: string, current: boolean, lang: string): string {
  const a = formatMonth(start, lang);
  const b = current ? cvLabels(lang).present : formatMonth(end, lang);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export function languageLevel(level: string, lang: string): string {
  return level === 'native' ? cvLabels(lang).native : level;
}
