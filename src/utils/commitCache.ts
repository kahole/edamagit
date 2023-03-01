import { Commit, Repository } from '../typings/git';

const commitCache: { [hash: string]: Promise<Commit>; } = {};

export function getCommit(repository: Repository, hash: string): Promise<Commit> {

  //@ts-expect-error TS2801
  if (commitCache[hash]) {
    return commitCache[hash];
  }

  const commitTask = repository.getCommit(hash);
  commitCache[hash] = commitTask;
  return commitTask;
}