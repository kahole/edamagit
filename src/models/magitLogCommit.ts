import { Commit } from '../typings/git';

export interface MagitLogEntry {
  commit: Commit;
  graph: string[] | undefined;
  refs: string[];
  author: string;
  time: Date;
}