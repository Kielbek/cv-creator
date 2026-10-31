import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Cv } from '../cv/cv.model';

/** The text-only view of a CV that is sent to the AI (no contact data, dates or photo). */
export interface CvText {
  headline: string;
  summary: string;
  experience: { id: string; position: string; company: string; location: string; description: string }[];
  education: { id: string; degree: string; school: string; location: string; description: string }[];
  skills: { id: string; name: string }[];
  languages: { id: string; name: string; level: string }[];
  projects: { id: string; name: string; description: string }[];
  certificates: { id: string; name: string; issuer: string }[];
  interests: string;
}

export interface TailorResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  tailoredSummary: string;
}

export type AiErrorCode = 'rate_limited' | 'ai_unavailable' | 'invalid' | 'network';

export class AiError extends Error {
  constructor(
    readonly code: AiErrorCode,
    readonly retryAfter?: number,
  ) {
    super(code);
  }
}

export function toCvText(cv: Cv): CvText {
  return {
    headline: cv.personal.headline,
    summary: cv.summary,
    experience: cv.experience.map(({ id, position, company, location, description }) => ({ id, position, company, location, description })),
    education: cv.education.map(({ id, degree, school, location, description }) => ({ id, degree, school, location, description })),
    skills: cv.skills.map(({ id, name }) => ({ id, name })),
    languages: cv.languages.map(({ id, name, level }) => ({ id, name, level })),
    projects: cv.projects.map(({ id, name, description }) => ({ id, name, description })),
    certificates: cv.certificates.map(({ id, name, issuer }) => ({ id, name, issuer })),
    interests: cv.interests,
  };
}

/** Writes a translated text view back into the CV, matching items by id; dates, contacts and design stay. */
export function mergeCvText(cv: Cv, t: CvText): void {
  const byId = <T extends { id: string }>(list: T[] | undefined) => new Map((list ?? []).map((i) => [i.id, i]));
  cv.personal.headline = t.headline ?? cv.personal.headline;
  cv.summary = t.summary ?? cv.summary;
  cv.interests = t.interests ?? cv.interests;
  const ex = byId(t.experience);
  cv.experience.forEach((e) => Object.assign(e, pick(ex.get(e.id), ['position', 'company', 'location', 'description'])));
  const ed = byId(t.education);
  cv.education.forEach((e) => Object.assign(e, pick(ed.get(e.id), ['degree', 'school', 'location', 'description'])));
  const sk = byId(t.skills);
  cv.skills.forEach((e) => Object.assign(e, pick(sk.get(e.id), ['name'])));
  const la = byId(t.languages);
  cv.languages.forEach((e) => Object.assign(e, pick(la.get(e.id), ['name'])));
  const pr = byId(t.projects);
  cv.projects.forEach((e) => Object.assign(e, pick(pr.get(e.id), ['name', 'description'])));
  const ce = byId(t.certificates);
  cv.certificates.forEach((e) => Object.assign(e, pick(ce.get(e.id), ['name', 'issuer'])));
}

function pick<T extends object>(src: T | undefined, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  if (!src) return out;
  for (const k of keys) {
    const v = src[k];
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  /** null = not checked yet */
  readonly enabled = signal<boolean | null>(null);

  constructor() {
    this.http.get<{ enabled: boolean }>('/api/v1/ai/status').subscribe({
      next: (s) => this.enabled.set(s.enabled),
      error: () => this.enabled.set(false),
    });
  }

  summary(cv: Cv, tone: string): Promise<{ summary: string }> {
    return this.post('summary', { language: cv.language, country: cv.country, tone, cv: toCvText(cv) });
  }

  improve(cv: Cv, position: string, company: string, text: string): Promise<{ bullets: string[] }> {
    return this.post('improve', { language: cv.language, country: cv.country, position, company, text });
  }

  tailor(cv: Cv, jobOffer: string): Promise<TailorResult> {
    return this.post('tailor', { language: cv.language, country: cv.country, cv: toCvText(cv), jobOffer });
  }

  translate(cv: Cv, targetLanguage: string, targetCountry: string): Promise<CvText> {
    return this.post('translate', { sourceLanguage: cv.language, targetLanguage, targetCountry, cv: toCvText(cv) });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.post<T>(`/api/v1/ai/${path}`, body));
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 429) throw new AiError('rate_limited', Number(e.headers.get('Retry-After')) || undefined);
        if (e.status === 400) throw new AiError('invalid');
        if (e.status === 0) throw new AiError('network');
      }
      throw new AiError('ai_unavailable');
    }
  }
}
