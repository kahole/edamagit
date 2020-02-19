import { MagitRepository } from '../models/magitRepository';
import { SpawnOptions } from '../common/gitApiExtensions';
import MagitLogger from './logger';

export async function gitRun(repository: MagitRepository, args: string[], spawnOptions?: SpawnOptions) {

  const logEntry = MagitLogger.logGitCommand(args);

  try {

    // Protects against projected change in internal api in vscode git extension
    if (repository._repository.repository.run) {
      return await repository._repository.repository.run(args, spawnOptions);
    } else {
      return await repository._repository.repository.exec!(args, spawnOptions);
    }
  } catch (error) {
    MagitLogger.logGitError(error, logEntry);
    throw error;
  }
}