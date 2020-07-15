import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TokenView } from '../general/tokenView';
import { TextView } from '../general/textView';
import { Commit, Ref } from '../../typings/git';
import GitTextUtils from '../../utils/gitTextUtils';

export class CommitSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return this.section.toString(); }

  constructor(private section: Section, commits: Commit[], refs?: Ref[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section),
      ...commits.map(commit => new CommitItemView(commit, undefined, refs)),
    ];
  }
}

export class CommitItemView extends View {

  constructor(public commit: Commit, qualifier?: string, refs?: Ref[]) {
    super();
    this.subViews = [];
    this.addSubview(new TextView(`${qualifier ? qualifier + ' ' : ''}${GitTextUtils.shortHash(commit.hash)} `));
    const matchingRefs = (refs ?? [])?.filter(ref => ref.commit === commit.hash);
    matchingRefs.forEach(ref => {
      this.addSubview(new TokenView(ref.name ?? '', ref.remote ? 'magit-remote-ref-name' : 'magit-ref-name'));
      this.addSubview(new TextView(' '));
    });
    this.addSubview(new TextView(`${GitTextUtils.shortCommitMessage(commit.message)}`));
  }
}