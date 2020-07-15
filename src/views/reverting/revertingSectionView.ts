import { View } from '../general/view';
import { SectionHeaderView, Section } from '../general/sectionHeader';
import { Commit } from '../../typings/git';
import { CommitItemView } from '../commits/commitSectionView';
import { MagitRevertingState } from '../../models/magitRevertingState';

export class RevertingSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return 'Reverting'; }

  constructor(revertingState: MagitRevertingState, log: Commit[]) {
    super();

    const doneCommits: Commit[] = [];

    for (const commit of log) {
      if (commit.hash === revertingState.originalHead.hash) {
        break;
      }
      doneCommits.push(commit);
    }

    this.subViews = [
      new SectionHeaderView(Section.Reverting),
      ...revertingState.upcomingCommits.map(commit => new CommitItemView(commit, 'revert')),
      new CommitItemView(revertingState.currentCommit, 'join'),
      ...doneCommits.map(commit => new CommitItemView(commit, 'done')),
      new CommitItemView(revertingState.originalHead, 'onto'),
    ];
  }
}