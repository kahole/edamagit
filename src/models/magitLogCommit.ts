import { Commit } from '../typings/git';

export interface MagitLogEntry {
  commit: Commit;
  graph: string[] | undefined;
  refs: string | undefined;
  author: string;
  time: Date;
}