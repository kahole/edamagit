import { Commit } from '../typings/git';
import { MagitRepository } from '../models/magitRepository';

const commitCache: { [hash: string]: Promise<Commit>; } = {};

export function getCommit(repository: MagitRepository, hash: string): Promise<Commit> {

  if (commitCache[hash]) {
    return commitCache[hash];
  }

  const commitTask = repository.getCommit(hash);
  commitCache[hash] = commitTask;
  return commitTask;
}