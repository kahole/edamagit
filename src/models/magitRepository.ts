import { Repository } from '../typings/git';
import { Commit, Ref, Submodule } from '../typings/git';
import { MagitChange } from './magitChange';
import { MagitBranch } from './magitBranch';
import { MagitMergingState } from './magitMergingState';
import { MagitRebasingState } from './magitRebasingState';
import { MagitRemote } from './magitRemote';
import { MagitCherryPickingState } from './magitCherryPickingState';
import { MagitRevertingState } from './magitRevertingState';
import { Stash } from './stash';
import { PullRequest } from './pullRequest';
import { Uri } from 'vscode';

export interface MagitRepository {
  readonly uri: Uri;
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
  readonly refs: Ref[];
  readonly submodules: Submodule[];
  readonly gitRepository: Repository;

  readonly forgeState?: ForgeState;
}

export interface ForgeState {
  readonly forgeRemote: string;
  readonly pullRequests: PullRequest[];
}