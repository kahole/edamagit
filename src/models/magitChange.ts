import { Change } from '../typings/git';
import { MagitChangeHunk } from './magitChangeHunk';
import { Section } from '../views/general/sectionHeader';

export interface MagitChange extends Change {
  hunks?: MagitChangeHunk[];
  relativePath?: string;
  section?: Section;
}
