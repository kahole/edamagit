import { MagitRepository } from '../models/magitRepository';
import { SpawnOptions } from '../common/gitApiExtensions';
import MagitLogger from './logger';

export enum LogLevel {
  None,
  Error,
  Detailed
}

export async function gitRun(repository: MagitRepository, args: string[], spawnOptions?: SpawnOptions, logLevel = LogLevel.Detailed) {

  let logEntry;
  if (logLevel > LogLevel.None) {
    logEntry = MagitLogger.logGitCommand(args);
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
      MagitLogger.logGitResult(result, logEntry);
    }

    return result;
  } catch (error) {
    if (logLevel > LogLevel.None && logEntry) {
      MagitLogger.logGitError(error, logEntry);
    }
    throw error;
  }
}