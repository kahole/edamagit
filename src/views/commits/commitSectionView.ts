import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Commit, Ref } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';
import { SemanticTextView, Token } from '../general/semanticTextView';
import { SemanticTokenTypes } from '../../common/constants';

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
    const matchingRefs = (refs ?? [])?.filter(ref => ref.commit === commit.hash);
    let refsContent: (string | Token)[] = [];
    matchingRefs.forEach(ref => {
      refsContent.push(new Token(ref.name ?? '', ref.remote ? SemanticTokenTypes.RemoteRefName : SemanticTokenTypes.RefName));
      refsContent.push(' ');
    });
    this.content = [
      `${qualifier ? qualifier + ' ' : ''}${GitTextUtils.shortHash(commit.hash)} `,
      ...refsContent,
      `${GitTextUtils.shortCommitMessage(commit.message)}`];
  }
}