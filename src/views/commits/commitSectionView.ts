import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TextView } from '../general/textView';
import { Commit } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';

export class CommitSectionView extends View {
  isFoldable = true;

  constructor(headerView: View, commits: Commit[]) {
    super();
    this.subViews = [
      headerView,
      ...commits.map(commit => new CommitItemView(commit)),
      new LineBreakView()
    ];
  }
}

export class CommitItemView extends TextView {

  constructor(public commit: Commit) {
    super();
    this.textContent = `${GitTextUtils.shortHash(commit.hash)} ${GitTextUtils.shortCommitMessage(commit.message)}`;
  }
}