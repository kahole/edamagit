import { Commit } from '../typings/git';

export interface MagitCommit extends Commit {
  diff?: string;
}