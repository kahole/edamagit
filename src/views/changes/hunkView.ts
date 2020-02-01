import { MagitChangeHunk } from '../../models/magitChangeHunk';
import { TextView } from '../general/textView';

export class HunkView extends TextView {
  isFoldable = true;

  get id() { return this.changeHunk.diff; }

  constructor(public changeHunk: MagitChangeHunk) {
    super(changeHunk.diff);
  }
}