import { Repository } from '../typings/git';
import { run, SpawnOptions } from './commandRunner/command';
import GitProcessLogger from './gitProcessLogger';

export enum LogLevel {
  None,
  Error,
  Detailed
}

export async function gitRun(repository: Repository, args: string[], spawnOptions?: SpawnOptions, logLevel = LogLevel.Detailed) {

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

    return result;
  } catch (error) {
    if (logLevel > LogLevel.None && logEntry) {
      GitProcessLogger.logGitError(error, logEntry);
    }
    throw error;
  }
}
