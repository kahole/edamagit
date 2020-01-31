import { Commit } from '../typings/git';
import { MagitRepository } from '../models/magitRepository';

const commitCache: { [hash: string]: Commit; } = {};

export async function getCommit(repository: MagitRepository, hash: string) {
  return commitCache[hash] ?? repository.getCommit(hash).then(c => {
    commitCache[c.hash] = c;
    return c;
  });
}