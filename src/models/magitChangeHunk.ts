import { Section } from '../views/general/sectionHeader';
import { Uri } from 'vscode';

export interface MagitChangeHunk {
  diff: string;
  diffHeader: string;
  section: Section;
  uri: Uri;
}