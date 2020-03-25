import { View } from '../general/view';
import { MagitChange } from '../../models/magitChange';
import { ChangeView } from './changeView';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { LineBreakView } from '../general/lineBreakView';

export class ChangeSectionView extends View {
  isFoldable = true;

  get id() { return this.section.toString() + this.context; }

  constructor(public section: Section, public changes: MagitChange[], private context = '') {
    super();
    this.subViews = [
      new SectionHeaderView(section, changes.length),
      ...changes.map(change => new ChangeView(change, context)),
      new LineBreakView()
    ];
  }
}