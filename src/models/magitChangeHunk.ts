import { Section } from '../views/general/sectionHeader';

export interface MagitChangeHunk {
  diff: string;
  diffHeader: string;
  section: Section;
}