import { RepositoryState, Commit, Repository, Change as GitChange, Status } from "../typings/git";

export interface Change extends GitChange {
  diff?: string;
}

export interface MagitState {
  _state: RepositoryState; // TODO: shouldnt need this?
  readonly stashes?: Commit[];
  readonly log?: Commit[];
  readonly commitCache: { [id: string]: Commit; }; // TODO: rigid model with everything needed better?
  readonly workingTreeChanges?: Change[];
  readonly indexChanges?: Change[];
  readonly mergeChanges?: Change[];
  readonly untrackedFiles?: Change[];
}

export async function MagitStatus(repository: Repository): Promise<MagitState> {

  await repository.status();

  let logTask = repository.log({ maxEntries: 10 });

  let commitTasks = Promise.all(
    [repository.state.HEAD!.commit!]
      .map(c => repository.getCommit(c)));
  // .map(repository.getCommit));

  let untrackedFiles: Change[] = [];

  let workingTreeChanges_NoUntracked = repository.state.workingTreeChanges
    .filter( c => {
      if (c.status === Status.UNTRACKED) {
        untrackedFiles.push(c);
        return false;
      } else {
        return true;
      }
    });

  let workingTreeChangesTasks = Promise.all(workingTreeChanges_NoUntracked
    .map(change =>
      repository.diffWithHEAD(change.uri.path)
        .then(getOnlyChunksFromDiff)
        .then<Change>(diff => {
          let magitChange: Change = change;
          magitChange.diff = diff;
          return magitChange;
        })
    ));

  let indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(change =>
      repository.diffIndexWithHEAD(change.uri.path)
        .then(getOnlyChunksFromDiff)
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
    untrackedFiles
  };
}

function getOnlyChunksFromDiff(diff: string): string {
  return diff.substring(diff.indexOf("@@"));
}

// function inflateChanges(changes: GitChange[]) : Promise<Change[]> {
//   return Promise.all(changes
//     .map(change =>
//       repository.diffIndexWithHEAD(change.uri.path)
//         .then(getOnlyChunksFromDiff)
//         .then<Change>(diff => {
//           let magitChange: Change = change;
//           magitChange.diff = diff;
//           return magitChange;
//         })
//     ));
// }