import { View } from '../general/view';
import { MagitChange } from '../../models/magitChange';
import { HunkView } from './HunkView';
import { ChangeHeaderView } from './changeHeaderView';

export class ChangeView extends View {
  isFoldable = true;
  foldedByDefault = true;

  get id() { return this.change.uri.toString() + this.change.section?.toString() + this.change.hunks?.reduce((diffs, hunk) => (diffs + hunk.diffHeader ? hunk.diffHeader : ''), ''); }

  constructor(public change: MagitChange) {
    super();
    this.addSubview(new ChangeHeaderView(change));
    if (this.change.hunks) {
      this.addSubview(...this.change.hunks.map(hunk => new HunkView(hunk)));
    }
  }
}