import { Commit, Ref } from '../typings/git';
import { MagitChange } from './magitChange';
import { Stash } from '../common/gitApiExtensions';
import { MagitBranch } from './magitBranch';
import { MagitMergingState } from './magitMergingState';
import { MagitRebasingState } from './magitRebasingState';
import { MagitRemote } from './magitRemote';

export interface MagitState {
  readonly HEAD?: MagitBranch;
  readonly workingTreeChanges: MagitChange[];
  readonly indexChanges: MagitChange[];
  readonly mergeChanges: MagitChange[];
  readonly untrackedFiles: MagitChange[];
  readonly stashes: Stash[];
  readonly log: Commit[];
  readonly rebasingState?: MagitRebasingState;
  readonly mergingState?: MagitMergingState;
  readonly branches: Ref[];
  readonly remotes: MagitRemote[];
  readonly tags: Ref[];
  latestGitError?: string;
}