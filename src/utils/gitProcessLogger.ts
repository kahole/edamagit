import { processLog } from '../extension';
import { MagitProcessLogEntry } from '../models/magitProcessLogEntry';
import { IExecutionResult } from '../common/gitApiExtensions';

export default class GitProcessLogger {

  public static logGitCommand(args: string[]): MagitProcessLogEntry {
    const logEntry = { command: ['git', ...args], index: processLog.length };
    processLog.push(logEntry);
    if (processLog.length > 100) {
      processLog.shift();
    }
    return logEntry;
  }

  public static logGitResult(result: IExecutionResult<string>, entry: MagitProcessLogEntry) {
    entry.stdout = result.stdout;
    entry.stderr = result.stderr;
  }

  public static logGitError(error: any, entry: MagitProcessLogEntry) {
    const errorMsg = error.stderr ?? error.message;
    entry.stderr = errorMsg;
  }
}