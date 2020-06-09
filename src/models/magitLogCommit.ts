import { Commit } from '../typings/git';


export interface MagitLogCommit extends Commit {
  graph: string[] | undefined;
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;
}