import { PageSize } from './cv.model';

/**
 * Hiring conventions per target country. Drives defaults (CV language, page size, photo, consent clause) and the
 * tips shown in the editor. Easy to extend: add an entry.
 */
export interface CountryPreset {
  code: string;
  language: string;
  pageSize: PageSize;
  photo: 'expected' | 'optional' | 'avoid';
  /** Default data-processing clause, in the CV language. */
  consent?: string;
  /** i18n keys of tips (country.tips.*) */
  tips: string[];
}

const PL_CONSENT =
  'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).';

export const COUNTRIES: readonly CountryPreset[] = [
  { code: 'PL', language: 'pl', pageSize: 'A4', photo: 'optional', consent: PL_CONSENT, tips: ['consent', 'photoOptional', 'twoPages'] },
  { code: 'DE', language: 'de', pageSize: 'A4', photo: 'optional', tips: ['deLebenslauf', 'photoOptional', 'reverseChrono'] },
  { code: 'AT', language: 'de', pageSize: 'A4', photo: 'expected', tips: ['deLebenslauf', 'photoExpected'] },
  { code: 'CH', language: 'de', pageSize: 'A4', photo: 'expected', tips: ['photoExpected', 'twoPages'] },
  { code: 'GB', language: 'en', pageSize: 'A4', photo: 'avoid', tips: ['photoAvoid', 'noPersonal', 'twoPages'] },
  { code: 'IE', language: 'en', pageSize: 'A4', photo: 'avoid', tips: ['photoAvoid', 'noPersonal'] },
  { code: 'US', language: 'en', pageSize: 'LETTER', photo: 'avoid', tips: ['usResume', 'photoAvoid', 'noPersonal', 'onePage'] },
  { code: 'CA', language: 'en', pageSize: 'LETTER', photo: 'avoid', tips: ['photoAvoid', 'noPersonal', 'twoPages'] },
  { code: 'FR', language: 'fr', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'onePage'] },
  { code: 'ES', language: 'es', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'twoPages'] },
  { code: 'IT', language: 'it', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'itConsent'] },
  { code: 'PT', language: 'pt', pageSize: 'A4', photo: 'optional', tips: ['photoOptional'] },
  { code: 'NL', language: 'nl', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'twoPages'] },
  { code: 'BE', language: 'fr', pageSize: 'A4', photo: 'optional', tips: ['photoOptional'] },
  { code: 'CZ', language: 'cs', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'twoPages'] },
  { code: 'UA', language: 'uk', pageSize: 'A4', photo: 'optional', tips: ['photoOptional'] },
  { code: 'SE', language: 'en', pageSize: 'A4', photo: 'optional', tips: ['photoOptional', 'twoPages'] },
  { code: 'NO', language: 'en', pageSize: 'A4', photo: 'optional', tips: ['photoOptional'] },
];

export function findCountry(code: string): CountryPreset {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
