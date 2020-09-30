import { SpawnOptions } from '../common/gitApiExtensions';
import { Repository } from '../typings/git';
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
    let result;
    // Protects against projected change in internal api in vscode git extension
    if (repository._repository.repository.run) {
      result = await repository._repository.repository.run(args, spawnOptions);
    } else {
      result = await repository._repository.repository.exec!(args, spawnOptions);
    }

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