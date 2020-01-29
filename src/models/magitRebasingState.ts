import { Commit } from '../typings/git';
import { MagitBranch } from './magitBranch';

export interface MagitRebasingState {
  origBranchName: string;
  ontoBranch: MagitBranch;
  doneCommits: Commit[];
  currentCommit: Commit;
  upcomingCommits: Commit[];
}