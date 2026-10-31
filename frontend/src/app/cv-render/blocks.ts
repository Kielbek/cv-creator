import { Cv, SectionId, hasContent } from '../core/cv/cv.model';
import { Geometry } from '../core/cv/templates';

/**
 * The renderer cuts the CV into blocks - the smallest pieces that are never split across pages:
 *  - 'first': section heading + its first entry (a heading is never left alone at the bottom of a page)
 *  - 'item':  every further entry of a list section (job, school, project, certificate)
 *  - 'whole': short sections rendered in one piece (summary, skills, languages, contact, interests)
 *  - 'header': name/photo block when the template puts it in a sidebar column
 *  - 'consent': the data-processing clause at the end of the main column
 */
export type BlockKind = 'header' | 'whole' | 'first' | 'item' | 'consent';

export interface Block {
  key: string;
  kind: BlockKind;
  section: SectionId | null;
  index: number;
}

const LIST_SECTIONS = new Set<SectionId>(['experience', 'education', 'projects', 'certificates']);

export function sectionBlocks(cv: Cv, s: SectionId): Block[] {
  if (!hasContent(cv, s)) return [];
  if (!LIST_SECTIONS.has(s)) return [{ key: s, kind: 'whole', section: s, index: 0 }];
  const items = cv[s as 'experience' | 'education' | 'projects' | 'certificates'];
  return items.map((_, i) => ({ key: `${s}:${i}`, kind: i === 0 ? 'first' : 'item', section: s, index: i }));
}

export function buildColumns(cv: Cv, g: Geometry): Block[][] {
  const layout = Array.from({ length: g.columns }, (_, i) => cv.design.layout[i] ?? []);
  const cols = layout.map((sections) => sections.flatMap((s) => sectionBlocks(cv, s)));
  if (g.header === 'sidebar') cols[g.sidebarIndex].unshift({ key: 'header', kind: 'header', section: null, index: 0 });
  if (cv.consent.trim()) cols[g.mainIndex].push({ key: 'consent', kind: 'consent', section: null, index: 0 });
  return cols;
}

/** Page sizes in CSS px (96 dpi). */
export const PAGE = {
  A4: { width: 794, height: 1123 },
  LETTER: { width: 816, height: 1056 },
} as const;

/** Vertical padding of every column (must match --cv-pad-y in cv.css). */
export const PAD_Y = 36;
