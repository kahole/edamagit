import { Commit } from '../typings/git';

export interface MagitRevertingState {
  originalHead: Commit;
  currentCommit: Commit;
  upcomingCommits: Commit[];
}