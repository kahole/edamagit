import { View } from '../general/view';
import { MagitCherryPickingState } from '../../models/magitCherryPickingState';
import { SectionHeaderView, Section } from '../general/sectionHeader';
import { Commit } from '../../typings/git';
import { CommitItemView } from '../commits/commitSectionView';

export class CherryPickingSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return 'CherryPicking'; }

  constructor(cherryPickingState: MagitCherryPickingState, log: Commit[]) {
    super();

    const doneCommits: Commit[] = [];

    for (const commit of log) {
      if (commit.hash === cherryPickingState.originalHead.hash) {
        break;
      }
      doneCommits.push(commit);
    }

    this.subViews = [
      new SectionHeaderView(Section.CherryPicking),
      ...cherryPickingState.upcomingCommits.map(commit => new CommitItemView(commit, 'pick')),
      new CommitItemView(cherryPickingState.currentCommit, 'join'),
      ...doneCommits.map(commit => new CommitItemView(commit, 'done')),
      new CommitItemView(cherryPickingState.originalHead, 'onto'),
    ];
  }
}