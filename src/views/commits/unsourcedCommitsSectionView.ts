import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Commit, UpstreamRef, Ref } from '../../typings/git';
import { LineBreakView } from '../general/lineBreakView';
import { CommitItemView } from './commitSectionView';
import { MagitCommitList } from '../../models/magitBranch';

export class UnsourcedCommitSectionView extends View {
  isFoldable = true;

  static maxEntries = 256;

  get id() { return this.section.toString(); }

  constructor(private section: Section, upstream: UpstreamRef, list: MagitCommitList, refs: Ref[]) {
    super();
    this.subViews = [
      new SectionHeaderView(section, list.commits.length, `${upstream.remote}/${upstream.name}`, list.truncated),
      ...list.commits.map(commit => new CommitItemView(commit, undefined, refs)),
      new LineBreakView()
    ];
  }
}