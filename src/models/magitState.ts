import { RepositoryState, Commit } from "../typings/git";
import { MagitChange } from "./magitChange";
import { Stash } from "../common/gitApiExtensions";
import { MagitBranch } from "./magitBranch";

export interface MagitState {
  readonly commitCache: { [id: string]: Commit; }; // TODO: 6 tasks rely on this! rigid model with everything needed better?
  readonly HEAD?: MagitBranch;
  readonly workingTreeChanges: MagitChange[];
  readonly indexChanges: MagitChange[];
  readonly mergeChanges?: MagitChange[]; // Remove question mark?
  readonly untrackedFiles: MagitChange[];
  readonly stashes: Stash[];
  readonly log: Commit[];
  latestGitError?: string;
}