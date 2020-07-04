import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TokenView } from '../general/tokenView';
import { PlainTextView } from '../general/plainTextView';
import { Commit, Ref } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import GitTextUtils from '../../utils/gitTextUtils';

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

export class CommitItemView extends View {

  constructor(public commit: Commit, qualifier?: string, refs?: Ref[]) {
    super();
    this.subViews = [];
    this.addSubview(new PlainTextView(`${qualifier ? qualifier + ' ' : ''}${GitTextUtils.shortHash(commit.hash)} `));
    const matchingRefs = (refs ?? [])?.filter(ref => ref.commit === commit.hash);
    matchingRefs.forEach(ref => {
      this.addSubview(new TokenView(ref.name ?? '', ref.remote ? 'magit-remote-ref-name' : 'magit-ref-name'));
      this.addSubview(new PlainTextView(' '));
    });
    this.addSubview(new PlainTextView(`${GitTextUtils.shortCommitMessage(commit.message)}`));
  }
}