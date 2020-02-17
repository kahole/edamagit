import GitTextUtils from './gitTextUtils';
import { processLog } from '../extension';
import { MagitProcessLogEntry } from '../models/magitProcessLogEntry';

export default class MagitLogger {

  public static logGitCommand(args: string[]): MagitProcessLogEntry {
    const logEntry = { command: ['git', ...args], index: processLog.length };
    processLog.push(logEntry);
    return logEntry;
  }

  public static logGitError(error: any, entry: MagitProcessLogEntry) {
    const errorMsg = GitTextUtils.formatError(error);
    entry.output = errorMsg;
  }
}