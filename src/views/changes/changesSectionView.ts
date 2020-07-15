import { View } from '../general/view';
import { MagitChange } from '../../models/magitChange';
import { ChangeView } from './changeView';
import { Section, SectionHeaderView } from '../general/sectionHeader';

export class ChangeSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return this.section.toString() + this.context; }

  constructor(public section: Section, public changes: MagitChange[], private context = '') {
    super();
    this.subViews = [
      new SectionHeaderView(section, changes.length),
      ...changes.map(change => new ChangeView(change, context)),
    ];
  }
}