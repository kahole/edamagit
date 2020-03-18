import { Commit } from '../typings/git';

export interface MagitCherryPickingState {
  originalHead: Commit;
  currentCommit: Commit;
  upcomingCommits: Commit[];
}