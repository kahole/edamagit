import { gitRun } from '../utils/gitRawRunner';
import { MagitRepository } from '../models/magitRepository';


interface CherryPickOptions {
  noCommit?: boolean;
}

export async function cherryPick(repository: MagitRepository, commitHash: string, { noCommit }: CherryPickOptions) {

  const args = ['cherry-pick'];

  if (noCommit) {
    args.push('--no-commit');
  }

  args.push(commitHash);

  return gitRun(repository, args);
}