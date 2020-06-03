import { Commit } from '../typings/git';
import { LogCommit } from '../commands/loggingCommands';

export interface MagitLog {
  commits: LogCommit[];
  refName: string;
}