import { View } from '../general/view';
import { MagitChange } from '../../models/magitChange';
import { HunkView } from './hunkView';
import { ChangeHeaderView } from './changeHeaderView';
import { Section } from '../general/sectionHeader';

export class ChangeView extends View {
  isFoldable = true;
  foldedByDefault = true;

  get id() { return this.change.uri.toString() + this.section.toString() + this.context; }

  constructor(public section: Section, public change: MagitChange, private context = '') {
    super();
    this.addSubview(new ChangeHeaderView(change));
    if (this.change.hunks) {
      this.addSubview(...this.change.hunks.map(hunk => new HunkView(section, hunk)));
    }
  }
}