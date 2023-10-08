import { Repository } from '../typings/git';
import { run, SpawnOptions } from './commandRunner/command';
import { window } from 'vscode';
import GitProcessLogger from './gitProcessLogger';
import * as Constants from '../common/constants';

export enum LogLevel {
  None,
  Error,
  Detailed
}

export async function gitRun(repository: Repository, args: string[], spawnOptions?: SpawnOptions, logLevel = LogLevel.Detailed, showStatus: boolean = true) {
  if (showStatus) {
    window.setStatusBarMessage(`Running git ${args.join(' ')}...`);
  }

  let logEntry;
  if (logLevel > LogLevel.None) {
    logEntry = GitProcessLogger.logGitCommand(args);
  }

  try {
    let spawnOptionsWCwd = { ...spawnOptions };
    if (!spawnOptionsWCwd.cwd) {
      spawnOptionsWCwd.cwd = repository.rootUri;
    }
    let result = await run(args, spawnOptionsWCwd);

    if (logLevel === LogLevel.Detailed && logEntry) {
      GitProcessLogger.logGitResult(result, logEntry);
    }

    if (showStatus) {
      window.setStatusBarMessage(`Git finished successfully`, Constants.StatusMessageDisplayTimeout);
    }
    return result;
  } catch (error: any) {
    if (logLevel > LogLevel.None && logEntry) {
      GitProcessLogger.logGitError(error, logEntry);
    }

    if (showStatus) {
      window.setStatusBarMessage(error.message);
    }
    throw error;
  }
}
