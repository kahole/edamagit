import { processLog } from '../extension';
import { MagitProcessLogEntry } from '../models/magitProcessLogEntry';
import { IExecutionResult } from '../common/gitApiExtensions';

export default class MagitLogger {

  public static logGitCommand(args: string[]): MagitProcessLogEntry {
    const logEntry = { command: ['git', ...args], index: processLog.length };
    processLog.push(logEntry);
    return logEntry;
  }

  public static logGitResult(result: IExecutionResult<string>, entry: MagitProcessLogEntry) {
    entry.output = result.stdout;
  }

  public static logGitError(error: any, entry: MagitProcessLogEntry) {
    const errorMsg = error.stderr ?? error.message;
    entry.output = errorMsg;
  }
}