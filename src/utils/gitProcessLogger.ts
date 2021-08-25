import { processLog } from '../extension';
import { MagitProcessLogEntry } from '../models/magitProcessLogEntry';
import { IExecutionResult } from '../common/gitApiExtensions';

export default class GitProcessLogger {

  public static logGitCommand(args: string[]): MagitProcessLogEntry {
    const logEntry = { command: ['git', ...args], index: processLog.length, status: 'pending' };
    processLog.push(logEntry);
    if (processLog.length > 100) {
      processLog.shift();
    }
    return logEntry;
  }

  public static logGitResult(result: IExecutionResult<string>, entry: MagitProcessLogEntry) {
    entry.stdout = result.stdout;
    entry.stderr = result.stderr;
    entry.exitCode = result.exitCode;
  }

  public static logGitError(error: any, entry: MagitProcessLogEntry) {
    entry.stdout = error.stdout;
    entry.stderr = error.stderr ?? error.message;
    entry.exitCode = error.exitCode !== undefined ? error.exitCode : 1;
  }
}
