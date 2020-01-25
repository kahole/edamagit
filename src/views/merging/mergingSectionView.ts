import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Stash } from '../../common/gitApiExtensions';
import { TextView } from '../general/textView';
import { LineBreakView } from '../general/lineBreakView';
import { MagitMergingState } from '../../models/magitMergingState';
import { CommitItemView } from '../commits/commitSectionView';

export class MergingSectionView extends View {
  isFoldable = true;

  constructor(mergingState: MagitMergingState) {
    super();
    this.subViews = [
      new TextView(`Merging ${mergingState.mergingBranches[0]} (${mergingState.commits.length})`),
      ...mergingState.commits.map(commit => new CommitItemView(commit)),
      new LineBreakView()
    ];
  }
}