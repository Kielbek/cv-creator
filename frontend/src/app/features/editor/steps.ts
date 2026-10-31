import { AlignLeft, Briefcase, FileCheck2, GraduationCap, Languages, Puzzle, UserRound, Wrench } from 'lucide-angular';
import { Panel } from './panels/content-panel';

/** The wizard. Each step shows some content sections; the last one is design + AI + download. */
export interface Step {
  id: string;
  icon: typeof UserRound;
  sections: Panel[];
  /** pastel tile colours */
  bg: string;
  fg: string;
}

export const STEPS: readonly Step[] = [
  { id: 'header', bg: '#e8efff', fg: '#2563eb', icon: UserRound, sections: ['personal'] },
  { id: 'experience', bg: '#f1eaff', fg: '#7c3aed', icon: Briefcase, sections: ['experience'] },
  { id: 'education', bg: '#e6f7f3', fg: '#0f9d7a', icon: GraduationCap, sections: ['education'] },
  { id: 'skills', bg: '#fff1e6', fg: '#ea6a12', icon: Wrench, sections: ['skills'] },
  { id: 'languages', bg: '#ffe9f1', fg: '#db2777', icon: Languages, sections: ['languages'] },
  { id: 'summary', bg: '#e9f6ff', fg: '#0284c7', icon: AlignLeft, sections: ['summary'] },
  { id: 'extra', bg: '#fff7e0', fg: '#c58a00', icon: Puzzle, sections: ['projects', 'certificates', 'interests', 'consent'] },
  { id: 'finish', bg: '#eaf8ea', fg: '#16a34a', icon: FileCheck2, sections: [] },
];
