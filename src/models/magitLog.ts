import { MagitLogEntry } from './magitLogCommit';

export interface MagitLog {
  entries: MagitLogEntry[];
  revName: string;
}