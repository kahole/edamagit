import { Commit } from '../typings/git';
import { MagitBranch } from './magitBranch';

export interface MagitRebasingState {
  origBranchName: string;
  onto: { name: string, commitDetails: Commit };
  doneCommits: Commit[];
  currentCommit: Commit;
  upcomingCommits: Commit[];
}