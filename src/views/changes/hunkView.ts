import { MagitChangeHunk } from '../../models/magitChangeHunk';
import { TextView } from '../general/textView';

export class HunkView extends TextView {
  isFoldable = true;

  constructor(public changeHunk: MagitChangeHunk) {
    super();
    this.textContent = changeHunk.diff;
  }
}