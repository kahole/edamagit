import { MagitLogCommit } from './magitLogCommit';

export interface MagitLog {
  commits: MagitLogCommit[];
  revName: string;
}