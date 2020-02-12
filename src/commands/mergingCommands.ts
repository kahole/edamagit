import { MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import * as CommitCommands from '../commands/commitCommands';
import MagitUtils from '../utils/magitUtils';

const mergingMenu = {
  title: 'Merging',
  commands: [
    { label: 'm', description: 'Merge', action: merge },
    { label: 'e', description: 'Merge and edit message', action: (state: MenuState) => merge(state, false, false, true) },
    { label: 'n', description: 'Merge, don\'t commit', action: (state: MenuState) => merge(state, true, false, false) },
    { label: 'a', description: 'Absorb', action: absorb },
    // { label: 'p', description: 'Preview Merge', action: mergePreview },
    { label: 's', description: 'Squash Merge', action: (state: MenuState) => merge(state, false, true, false) },
    // { label: 'i', description: 'Merge into', action: mergeInto },
  ]
};

const whileMergingMenu = {
  title: 'Merging',
  commands: [
    { label: 'm', description: 'Commit merge', action: commitMerge },
    { label: 'a', description: 'Abort merge', action: abortMerge }
  ]
};

export async function merging(repository: MagitRepository) {

  if (repository.magitState?.mergingState) {
    return MenuUtil.showMenu(whileMergingMenu, { repository });
  } else {
    return MenuUtil.showMenu(mergingMenu, { repository });
  }
}

async function merge({ repository }: MenuState, noCommit = false, squashMerge = false, editMessage = false) {
  const ref = await MagitUtils.chooseRef(repository, 'Merge');

  if (ref) {
    return _merge(repository, ref, noCommit, squashMerge, editMessage);
  }
}

// async function mergeInto({ repository }: MenuState) {

// }

async function absorb({ repository }: MenuState) {
  const ref = await MagitUtils.chooseRef(repository, 'Merge');

  if (ref) {
    await _merge(repository, ref);
    return await repository.deleteBranch(ref, false);
  }
}

// async function mergePreview() {
//   // Commands to preview a merge between ref1 and ref2:
//   // git merge-base HEAD {ref2}
//   // git merge-tree {MERGE-BASE} HEAD {ref2}
//   // https://stackoverflow.com/questions/501407/is-there-a-git-merge-dry-run-option/6283843#6283843
// }

async function _merge(repository: MagitRepository, ref: string, noCommit = false, squashMerge = false, editMessage = false) {

  const args = ['merge', ref];

  if (noCommit) {
    args.push(...['--no-commit', '--no-ff']);
  }

  if (squashMerge) {
    args.push('--squash');
  }

  if (editMessage) {
    // Should really be "merge --edit" like this, but then there's no chance to update the "staged" view
    // args.push(...['--edit', '--no-ff']);
    // return CommitCommands.runCommitLikeCommand(repository, args);

    args.push(...['--no-commit', '--no-ff']);
    await gitRun(repository, args);

    MagitUtils.magitStatusAndUpdate(repository);

    return CommitCommands.runCommitLikeCommand(repository, ['commit']);

  } else {
    args.push('--no-edit');
  }

  return gitRun(repository, args);
}

async function commitMerge({ repository }: MenuState) {
  return CommitCommands.commit(repository);
}

async function abortMerge({ repository }: MenuState) {
  const args = ['merge', '--abort'];
  return gitRun(repository, args);
}