import { MagitChangeHunk } from '../../models/magitChangeHunk';
import { Section } from '../general/sectionHeader';
import { TextView } from '../general/textView';

export class HunkView extends TextView {
  isFoldable = true;

  get id() { return this.changeHunk.diff; }

  constructor(public section: Section, public changeHunk: MagitChangeHunk) {
    super(changeHunk.diff);
  }
}