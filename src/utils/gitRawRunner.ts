import { MagitRepository } from '../models/magitRepository';
import { SpawnOptions } from '../common/gitApiExtensions';

export async function gitRun(repository: MagitRepository, args: string[], spawnOptions?: SpawnOptions) {

  // Protects against projected change in internal api in vscode git extension
  if (repository._repository.repository.run) {
    return repository._repository.repository.run(args, spawnOptions);
  } else {
    return repository._repository.repository.exec!(args, spawnOptions);
  }
}