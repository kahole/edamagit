import { Change } from '../typings/git';
import { MagitChangeHunk } from './magitChangeHunk';

export interface MagitChange extends Change {
  hunks?: MagitChangeHunk[];
  diff?: string;
  relativePath?: string;
}

export interface ContextualMagitChange extends MagitChange {
  contextId: string
}