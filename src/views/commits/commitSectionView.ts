import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TokenView } from '../general/tokenView';
import { PlainTextView } from '../general/plainTextView';
import { Commit } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';

export class CommitSectionView extends View {
  isFoldable = true;

  get id() { return this.section.toString(); }

  constructor(private section: Section, commits: Commit[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section),
      ...commits.map(commit => new CommitItemView(commit)),
      new LineBreakView()
    ];
  }
}

export class CommitItemView extends View {

  constructor(public commit: Commit, qualifier?: string) {
    super();
    this.subViews = [
      new PlainTextView(`${qualifier ? qualifier + ' ' : ''}${GitTextUtils.shortHash(commit.hash)} ${GitTextUtils.shortCommitMessage(commit.message)}`)
    ];
  }
}