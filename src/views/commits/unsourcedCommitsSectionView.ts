import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Commit, UpstreamRef, Ref } from '../../typings/git';
import { CommitItemView } from './commitSectionView';

export class UnsourcedCommitSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return this.section.toString(); }

  constructor(private section: Section, upstream: UpstreamRef, commits: Commit[], refs: Ref[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section, commits.length, `${upstream.remote}/${upstream.name}`),
      ...commits.map(commit => new CommitItemView(commit, undefined, refs)),
    ];
  }
}