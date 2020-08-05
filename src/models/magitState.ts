import { Commit, Ref, Submodule } from '../typings/git';
import { MagitChange } from './magitChange';
import { Stash } from '../common/gitApiExtensions';
import { MagitBranch } from './magitBranch';
import { MagitMergingState } from './magitMergingState';
import { MagitRebasingState } from './magitRebasingState';
import { MagitRemote } from './magitRemote';
import { MagitCherryPickingState } from './magitCherryPickingState';
import { MagitRevertingState } from './magitRevertingState';

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
  readonly cherryPickingState?: MagitCherryPickingState;
  readonly revertingState?: MagitRevertingState;
  readonly branches: Ref[];
  readonly remotes: MagitRemote[];
  readonly tags: Ref[];
  readonly submodules: Submodule[];
  latestGitError?: string;
}