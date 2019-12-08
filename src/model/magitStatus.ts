import { RepositoryState, Commit } from "../typings/git";
import { Stash } from "../gitApiExtensions";
import { MagitChange } from "./magitChange";

export interface MagitState {
  _state: RepositoryState; // TODO: shouldnt need this?
  readonly commitCache: { [id: string]: Commit; }; // TODO: rigid model with everything needed better?
  readonly workingTreeChanges?: MagitChange[];
  readonly indexChanges?: MagitChange[];
  readonly mergeChanges?: MagitChange[];
  readonly untrackedFiles?: MagitChange[];
  readonly stashes?: Stash[];
  readonly log?: Commit[];
}