import { RepositoryState, Commit } from '../typings/git';
import { MagitChange } from './magitChange';
import { Stash } from '../common/gitApiExtensions';
import { MagitBranch } from './magitBranch';
import { MagitMergingState } from './magitMergingState';

export interface MagitState {
  readonly HEAD?: MagitBranch;
  readonly workingTreeChanges: MagitChange[];
  readonly indexChanges: MagitChange[];
  readonly mergeChanges: MagitChange[];
  readonly untrackedFiles: MagitChange[];
  readonly stashes: Stash[];
  readonly log: Commit[];
  readonly rebaseCommit?: Commit;
  readonly mergingState?: MagitMergingState;
  latestGitError?: string;
}