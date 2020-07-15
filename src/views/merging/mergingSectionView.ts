import { View } from '../general/view';
import { MagitMergingState } from '../../models/magitMergingState';
import { CommitItemView } from '../commits/commitSectionView';
import { SectionHeaderView, Section } from '../general/sectionHeader';

export class MergingSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return 'Merging'; }

  constructor(mergingState: MagitMergingState) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Merging, mergingState.commits.length, `${mergingState.mergingBranches[0]}`),
      ...mergingState.commits.map(commit => new CommitItemView(commit)),
    ];
  }
}