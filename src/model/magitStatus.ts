import { RepositoryState, Commit, Repository, Status, Change as GitChange } from "../typings/git";

export interface Change extends GitChange {
  readonly diff: string;
}

export interface MagitStatus {
  _state: RepositoryState;
  readonly stashes: Commit[] | undefined;
  readonly log: Commit[] | undefined;
  readonly commitCache: { [id: string] : Commit; };
  readonly workingTreeChanges: Change[]| undefined;
  readonly indexChanges: Change[]| undefined;
  readonly mergeChanges: Change[]| undefined;
  // test:
  readonly untrackedDiffTestProperty: string;
}

export async function InflateStatus(repository: Repository) : Promise<MagitStatus> {

  await repository.status();

  let logTask = repository.log({ maxEntries: 10 });

  let commitTasks = Promise.all(
    [repository.state.HEAD!.commit!]
    .map(c => repository.getCommit(c)));
    //.map(repository.getCommit);

    repository.state.workingTreeChanges.map(c => {
      console.log(c.uri.query);
    });

  let [log, commits, untrackedDiffTestProperty] = await Promise.all([logTask, commitTasks, repository.diff()]);

  let commitCache = commits.reduce( (prev, commit) => ({...prev, [commit.hash]: commit}), {});

  return {
    _state: repository.state,
    stashes: undefined,
    log,
    commitCache,
    workingTreeChanges: undefined,
    indexChanges: undefined,
    mergeChanges: undefined,
    untrackedDiffTestProperty
  };
}