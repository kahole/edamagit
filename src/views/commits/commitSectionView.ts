import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TextView } from '../general/textView';
import { Commit } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';

export class CommitSectionView extends View {
  isFoldable = true;

  constructor(section: Section, commits: Commit[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section),
      ...commits.map(commit => new CommitItemView(commit)),
      new LineBreakView()
    ];
  }
}

export class CommitItemView extends TextView {

  constructor(public commit: Commit) {
    super();
    this.textContent = `${GitTextUtils.shortHash(commit.hash)} ${commit.message.split('\n')[0]}`;
  }
}