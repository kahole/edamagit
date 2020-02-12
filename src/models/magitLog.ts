import { Commit } from '../typings/git';

export interface MagitLog {
  commits: Commit[];
  refName: string;
}