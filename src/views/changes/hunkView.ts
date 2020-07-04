import { MagitChangeHunk } from '../../models/magitChangeHunk';
import { View } from '../general/view';
import { TextView } from '../general/textView';

export class HunkView extends View {
  isFoldable = true;

  get id() { return this.changeHunk.diff; }

  constructor(public changeHunk: MagitChangeHunk) {
    super();
    this.addSubview(new TextView(changeHunk.diff));
  }
}