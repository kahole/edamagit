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
    // Protect against coming breaking change in VSCode: https://github.com/microsoft/vscode/pull/154555/files#diff-b7c16e46aefbf6182f8be03b099e5c407da09bd345ff2908abddd6bfe90c34aaL65-R65
    const baseRepository = repository._repository ?? repository.repository;
    let result = await baseRepository.repository.exec!(args, spawnOptions);

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