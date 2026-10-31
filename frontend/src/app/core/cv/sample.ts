import { Cv, CvDesign } from './cv.model';
import { defaultLayout, findTemplate } from './templates';
import { findCountry } from './countries';

/** Neutral illustrated avatar for the fictional example person (no real photo). */
const AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c7d2fe"/><stop offset="1" stop-color="#e9d5ff"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><circle cx="60" cy="47" r="21" fill="#7c6cf6" opacity=".85"/><path d="M20 120c4-26 20-38 40-38s36 12 40 38z" fill="#7c6cf6" opacity=".85"/></svg>`,
  );

/** Example content for previews, the template gallery and "load example". A fictional person. */
export function defaultDesign(templateId = 'atlas', country = 'PL'): CvDesign {
  const t = findTemplate(templateId);
  return {
    templateId: t.id,
    layout: defaultLayout(t, t.columns),
    accent: null,
    font: null,
    fontScale: 1,
    showPhoto: true,
    pageSize: findCountry(country).pageSize,
  };
}

export function emptyCv(language = 'pl', country = 'PL'): Cv {
  return {
    version: 1,
    language,
    country,
    personal: { firstName: '', lastName: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', photo: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certificates: [],
    interests: '',
    consent: findCountry(country).consent ?? '',
    design: defaultDesign('atlas', country),
    updatedAt: new Date().toISOString(),
  };
}

export function sampleCv(lang: string, templateId = 'atlas'): Cv {
  const pl = lang === 'pl';
  const country = pl ? 'PL' : 'GB';
  const cv = emptyCv(pl ? 'pl' : 'en', country);
  cv.design = defaultDesign(templateId, country);
  cv.personal = {
    firstName: 'Anna',
    lastName: 'Kowalska',
    headline: pl ? 'Specjalistka ds. marketingu' : 'Marketing Specialist',
    email: 'anna.kowalska@example.com',
    phone: '+48 123 456 789',
    location: pl ? 'Warszawa, Polska' : 'Warsaw, Poland',
    website: 'annakowalska.example',
    linkedin: 'linkedin.com/in/anna-kowalska',
    github: '',
    photo: AVATAR,
  };
  cv.summary = pl
    ? 'Specjalistka ds. marketingu z 5-letnim doświadczeniem w kampaniach performance i content marketingu dla marek B2C. Łączę analityczne podejście z kreatywnością – planuję, mierzę i optymalizuję działania w oparciu o dane. Szukam roli, w której rozwinę strategię marketingu w międzynarodowym zespole.'
    : 'Marketing specialist with 5 years of experience in performance and content marketing for B2C brands. Combines an analytical approach with creativity – plans, measures and optimises campaigns based on data. Looking for a role to grow marketing strategy in an international team.';
  cv.experience = [
    {
      id: 'e1',
      position: pl ? 'Specjalistka ds. marketingu' : 'Marketing Specialist',
      company: 'ABC Sp. z o.o.',
      location: pl ? 'Warszawa' : 'Warsaw',
      start: '2021-03',
      end: '',
      current: true,
      description: pl
        ? 'Prowadzę kampanie Google Ads i Meta z miesięcznym budżetem 200 tys. zł\nZwiększyłam konwersję sklepu o 28% dzięki testom A/B landing page\nKoordynuję współpracę z agencją i zespołem sprzedaży (8 osób)'
        : 'Run Google Ads and Meta campaigns with a monthly budget of PLN 200k\nIncreased store conversion by 28% through landing page A/B tests\nCoordinate work with the agency and the sales team (8 people)',
    },
    {
      id: 'e2',
      position: pl ? 'Młodsza specjalistka ds. content marketingu' : 'Junior Content Marketing Specialist',
      company: 'Media House',
      location: pl ? 'Kraków' : 'Kraków',
      start: '2019-06',
      end: '2021-02',
      current: false,
      description: pl
        ? 'Tworzyłam treści na bloga i social media dla 6 klientów\nWdrożyłam kalendarz publikacji i raportowanie w Google Analytics\nZwiększyłam ruch organiczny bloga klienta o 140% w rok'
        : 'Created blog and social media content for 6 clients\nIntroduced a publishing calendar and Google Analytics reporting\nGrew a client blog’s organic traffic by 140% in one year',
    },
  ];
  cv.education = [
    {
      id: 'ed1',
      degree: pl ? 'Magister, Marketing i zarządzanie' : 'MSc, Marketing and Management',
      school: pl ? 'Uniwersytet Warszawski' : 'University of Warsaw',
      location: pl ? 'Warszawa' : 'Warsaw',
      start: '2017-10',
      end: '2019-06',
      current: false,
      description: '',
    },
  ];
  cv.skills = [
    { id: 's1', name: 'Google Ads', level: 5 },
    { id: 's2', name: 'Meta Ads', level: 4 },
    { id: 's3', name: 'Google Analytics 4', level: 4 },
    { id: 's4', name: 'SEO', level: 4 },
    { id: 's5', name: 'Copywriting', level: 5 },
    { id: 's6', name: 'Figma', level: 3 },
  ];
  cv.languages = [
    { id: 'l1', name: pl ? 'Polski' : 'Polish', level: 'native' },
    { id: 'l2', name: pl ? 'Angielski' : 'English', level: 'C1' },
    { id: 'l3', name: pl ? 'Niemiecki' : 'German', level: 'B1' },
  ];
  cv.certificates = [{ id: 'c1', name: 'Google Ads Search Certification', issuer: 'Google', date: '2023-05' }];
  cv.interests = pl ? 'Fotografia, bieganie, podróże po Azji' : 'Photography, running, travelling in Asia';
  return cv;
}
