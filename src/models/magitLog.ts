import { LogCommit } from '../commands/loggingCommands';

export interface MagitLog {
  commits: LogCommit[];
  revName: string;
}