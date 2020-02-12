import { Commit } from '../typings/git';

export interface MagitMergingState {
  mergingBranches: string[];
  commits: Commit[];
}