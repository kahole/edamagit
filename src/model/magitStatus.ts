import { RepositoryState, Commit, Repository, Status, Change as GitChange } from "../typings/git";

export interface Change extends GitChange {
  diff?: string;
}

export interface MagitStatus {
  _state: RepositoryState;
  readonly stashes?: Commit[];
  readonly log?: Commit[];
  readonly commitCache: { [id: string]: Commit; };
  readonly workingTreeChanges?: Change[];
  readonly indexChanges?: Change[];
  readonly mergeChanges?: Change[];
  // test:
  readonly untrackedDiffTestProperty: string;
}

export async function InflateStatus(repository: Repository): Promise<MagitStatus> {

  await repository.status();

  let logTask = repository.log({ maxEntries: 10 });

  let commitTasks = Promise.all(
    [repository.state.HEAD!.commit!]
      .map(c => repository.getCommit(c)));
  // .map(repository.getCommit));

  let workingTreeChangesTasks = Promise.all(repository.state.workingTreeChanges
    .map(change =>
      repository.diffWithHEAD(change.uri.path)
        .then<Change>(diff => {
          let magitChange: Change = change;
          magitChange.diff = diff;
          return magitChange;
        })
    ));

    let indexChangesTasks = Promise.all(repository.state.indexChanges
      .map(change =>
        repository.diffIndexWithHEAD(change.uri.path)
          .then<Change>(diff => {
            let magitChange: Change = change;
            magitChange.diff = diff;
            return magitChange;
          })
      ));

  let [log, commits, workingTreeChanges, indexChanges] =
    await Promise.all([
      logTask,
      commitTasks,
      workingTreeChangesTasks,
      indexChangesTasks
    ]);

  let commitCache = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  return {
    _state: repository.state,
    stashes: undefined,
    log,
    commitCache,
    workingTreeChanges,
    indexChanges,
    mergeChanges: undefined,
    untrackedDiffTestProperty: ""
  };
}