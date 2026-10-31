import { AlignLeft, Briefcase, FileCheck2, GraduationCap, Languages, Puzzle, UserRound, Wrench } from 'lucide-angular';
import { Panel } from './panels/content-panel';

/** The wizard. Each step shows some content sections; the last one is design + AI + download. */
export interface Step {
  id: string;
  icon: typeof UserRound;
  sections: Panel[];
}

export const STEPS: readonly Step[] = [
  { id: 'header', icon: UserRound, sections: ['personal'] },
  { id: 'experience', icon: Briefcase, sections: ['experience'] },
  { id: 'education', icon: GraduationCap, sections: ['education'] },
  { id: 'skills', icon: Wrench, sections: ['skills'] },
  { id: 'languages', icon: Languages, sections: ['languages'] },
  { id: 'summary', icon: AlignLeft, sections: ['summary'] },
  { id: 'extra', icon: Puzzle, sections: ['projects', 'certificates', 'interests', 'consent'] },
  { id: 'finish', icon: FileCheck2, sections: [] },
];
