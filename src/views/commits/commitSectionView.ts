import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Commit, Ref, RefType } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';
import { SemanticTextView, Token } from '../general/semanticTextView';
import { SemanticTokenTypes } from '../../common/constants';
import ViewUtils from '../../utils/viewUtils';

export class CommitSectionView extends View {
  isFoldable = true;

  get id() { return this.section.toString(); }

  constructor(private section: Section, commits: Commit[], refs?: Ref[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section),
      ...commits.map(commit => new CommitItemView(commit, undefined, refs)),
      new LineBreakView()
    ];
  }
}

export class CommitItemView extends SemanticTextView {

  constructor(public commit: Commit, qualifier?: string, refs?: Ref[]) {
    super();

    this.content = [
      `${qualifier !== undefined ? qualifier + ' ' : ''}${GitTextUtils.shortHash(commit.hash)} `,
      ...ViewUtils.generateRefTokensLine(commit.hash, refs),
      `${GitTextUtils.shortCommitMessage(commit.message)}`];
  }
}