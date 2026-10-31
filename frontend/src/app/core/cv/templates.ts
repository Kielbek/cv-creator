import { CvDesign, FontId, SectionId } from './cv.model';

/**
 * Template registry. A template is pure data: a default skeleton (1-3 columns) plus a handful of style switches
 * that the shared stylesheet (src/styles/cv.css) understands. To add a template, add an entry to TEMPLATES -
 * no component code needed. To add a new visual variant (e.g. a new heading style), add the value to the union
 * type below and a matching `[data-heading='...']` rule to cv.css.
 *
 * Users can override the skeleton (1/2/3 columns) and move sections freely; the template only gives defaults.
 */
export type HeaderStyle = 'left' | 'center' | 'banner' | 'sidebar';
export type HeadingStyle = 'underline' | 'caps' | 'bar' | 'pill' | 'line' | 'minimal';
export type ColumnTheme = 'plain' | 'tinted' | 'dark' | 'accent';
export type SkillStyle = 'chips' | 'bars' | 'dots' | 'list';
export type PhotoShape = 'circle' | 'rounded' | 'square';
export type TemplateTag = 'ats' | 'modern' | 'classic' | 'creative' | 'minimal';

export interface CvTemplate {
  id: string;
  name: string;
  tags: TemplateTag[];
  /** Simple structure + real text: safe for applicant tracking systems. */
  ats: boolean;
  columns: 1 | 2 | 3;
  /** Side of the narrow column in a 2-column skeleton. */
  sidebar: 'left' | 'right';
  sidebarTheme: ColumnTheme;
  header: HeaderStyle;
  heading: HeadingStyle;
  font: FontId;
  accent: string;
  photo: PhotoShape;
  skills: SkillStyle;
  /** Optional explicit default placement, keyed by column count. */
  layouts?: Partial<Record<1 | 2 | 3, SectionId[][]>>;
}

export const TEMPLATES: readonly CvTemplate[] = [
  { id: 'atlas', name: 'Atlas', tags: ['ats', 'classic'], ats: true, columns: 1, sidebar: 'left', sidebarTheme: 'plain', header: 'left', heading: 'underline', font: 'inter', accent: '#2f54eb', photo: 'circle', skills: 'chips' },
  { id: 'harvard', name: 'Harvard', tags: ['ats', 'classic'], ats: true, columns: 1, sidebar: 'left', sidebarTheme: 'plain', header: 'center', heading: 'line', font: 'lora', accent: '#1f2937', photo: 'circle', skills: 'list' },
  { id: 'clarity', name: 'Clarity', tags: ['ats', 'minimal'], ats: true, columns: 1, sidebar: 'left', sidebarTheme: 'plain', header: 'left', heading: 'caps', font: 'system', accent: '#0f766e', photo: 'rounded', skills: 'list' },
  { id: 'nova', name: 'Nova', tags: ['modern'], ats: false, columns: 2, sidebar: 'left', sidebarTheme: 'tinted', header: 'sidebar', heading: 'bar', font: 'inter', accent: '#5b4cf5', photo: 'circle', skills: 'bars' },
  { id: 'onyx', name: 'Onyx', tags: ['modern', 'creative'], ats: false, columns: 2, sidebar: 'left', sidebarTheme: 'dark', header: 'sidebar', heading: 'caps', font: 'inter', accent: '#a78bfa', photo: 'circle', skills: 'dots' },
  { id: 'aurora', name: 'Aurora', tags: ['modern', 'creative'], ats: false, columns: 2, sidebar: 'right', sidebarTheme: 'plain', header: 'banner', heading: 'pill', font: 'inter', accent: '#6d28d9', photo: 'circle', skills: 'chips' },
  { id: 'executive', name: 'Executive', tags: ['classic', 'modern'], ats: true, columns: 2, sidebar: 'left', sidebarTheme: 'plain', header: 'banner', heading: 'underline', font: 'georgia', accent: '#1e3a5f', photo: 'square', skills: 'list' },
  { id: 'mono', name: 'Mono', tags: ['minimal'], ats: true, columns: 2, sidebar: 'right', sidebarTheme: 'plain', header: 'left', heading: 'minimal', font: 'system', accent: '#111827', photo: 'rounded', skills: 'list' },
  { id: 'coral', name: 'Coral', tags: ['creative'], ats: false, columns: 2, sidebar: 'left', sidebarTheme: 'accent', header: 'sidebar', heading: 'bar', font: 'inter', accent: '#e8590c', photo: 'circle', skills: 'bars' },
  { id: 'trio', name: 'Trio', tags: ['modern', 'creative'], ats: false, columns: 3, sidebar: 'left', sidebarTheme: 'tinted', header: 'banner', heading: 'caps', font: 'inter', accent: '#0e7490', photo: 'circle', skills: 'chips' },
];

export function findTemplate(id: string): CvTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** The resolved geometry the renderer works with. */
export interface Geometry {
  template: CvTemplate;
  columns: number;
  /** fractions, sum 1 */
  widths: number[];
  themes: ColumnTheme[];
  /** header actually used ('sidebar' falls back to 'left' for 1 column) */
  header: HeaderStyle;
  /** column holding the header in 'sidebar' mode */
  sidebarIndex: number;
  /** widest column: gets the consent clause and orphaned sections */
  mainIndex: number;
  accent: string;
  font: FontId;
}

export function geometry(design: CvDesign): Geometry {
  const template = findTemplate(design.templateId);
  const columns = clampColumns(design.columns ?? template.columns);
  let widths: number[];
  let sidebarIndex = 0;
  if (columns === 1) {
    widths = [1];
  } else if (columns === 2) {
    widths = template.sidebar === 'left' ? [0.34, 0.66] : [0.66, 0.34];
    sidebarIndex = template.sidebar === 'left' ? 0 : 1;
  } else {
    widths = [0.27, 0.46, 0.27];
    sidebarIndex = template.sidebar === 'left' ? 0 : 2;
  }
  const mainIndex = widths.indexOf(Math.max(...widths));
  const themes = widths.map((_, i) => (columns > 1 && i === sidebarIndex ? template.sidebarTheme : 'plain'));
  const header = template.header === 'sidebar' && columns === 1 ? 'left' : template.header;
  return {
    template,
    columns,
    widths,
    themes,
    header,
    sidebarIndex,
    mainIndex,
    accent: design.accent ?? template.accent,
    font: design.font ?? template.font,
  };
}

export function clampColumns(n: number): 1 | 2 | 3 {
  return (n <= 1 ? 1 : n >= 3 ? 3 : 2) as 1 | 2 | 3;
}

const SIDE: SectionId[] = ['contact', 'skills', 'languages', 'certificates', 'interests'];
const MAIN: SectionId[] = ['summary', 'experience', 'education', 'projects'];

/** Default placement for a template at a given column count. */
export function defaultLayout(t: CvTemplate, columns: 1 | 2 | 3): SectionId[][] {
  const explicit = t.layouts?.[columns];
  if (explicit) return explicit.map((c) => [...c]);
  const g = geometry({ templateId: t.id, columns } as CvDesign);
  // in a top/banner header the contact line sits in the header; as a section it is only needed in a sidebar
  const contactInSidebar = g.header === 'sidebar';
  const side = SIDE.filter((s) => s !== 'contact' || contactInSidebar);
  if (columns === 1) return [[...MAIN, 'skills', 'languages', 'certificates', 'interests']];
  if (columns === 2) {
    const out: SectionId[][] = [[], []];
    out[g.sidebarIndex] = side;
    out[1 - g.sidebarIndex] = [...MAIN];
    return out;
  }
  const out: SectionId[][] = [[], [], []];
  const other = g.sidebarIndex === 0 ? 2 : 0;
  out[g.sidebarIndex] = side.filter((s) => s === 'contact' || s === 'skills' || s === 'languages');
  out[1] = ['summary', 'experience', 'education'];
  out[other] = ['projects', 'certificates', 'interests'];
  return out;
}

/**
 * Re-fit an existing (possibly user-arranged) layout to a new column count. With the same number of columns the
 * user's arrangement is kept as is; otherwise sections keep their relative order and move to the column they
 * "belong" to in the new skeleton. Sections the user removed stay removed.
 */
export function refitLayout(layout: SectionId[][], t: CvTemplate, columns: 1 | 2 | 3): SectionId[][] {
  if (layout.length === columns) return dedupe(layout);
  const target = defaultLayout(t, columns);
  const g = geometry({ templateId: t.id, columns } as CvDesign);
  const homeOf = new Map<SectionId, number>();
  target.forEach((col, i) => col.forEach((s) => homeOf.set(s, i)));
  const out: SectionId[][] = Array.from({ length: columns }, () => []);
  for (const s of dedupe(layout).flat()) {
    if (homeOf.has(s)) out[homeOf.get(s)!].push(s);
    else if (s === 'contact' && columns > 1) out[g.sidebarIndex].unshift(s);
  }
  return out;
}

export function dedupe(layout: SectionId[][]): SectionId[][] {
  const seen = new Set<SectionId>();
  return layout.map((col) =>
    col.filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    }),
  );
}
