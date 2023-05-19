import { Commit, Repository } from '../typings/git';

const commitCache: { [hash: string]: Promise<Commit> | undefined; } = {};

export function getCommit(repository: Repository, hash: string): Promise<Commit> {

  let cachedResult = commitCache[hash];
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const commitTask = repository.getCommit(hash);
  commitCache[hash] = commitTask;
  return commitTask;
}