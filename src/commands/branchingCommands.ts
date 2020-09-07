import { window, workspace } from 'vscode';
import { views } from '../extension';
import { MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { GitErrorCodes, Ref, RefType } from '../typings/git';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import ShowRefsView from '../views/showRefsView';

const branchingMenu = {
  title: 'Branching',
  commands: [
    { label: 'b', description: 'Checkout', action: checkout },
    { label: 'l', description: 'Checkout local branch', action: checkoutLocal },
    { label: 'c', description: 'Checkout new branch', action: checkoutNewBranch },
    // { label: "w", description: "Checkout new worktree", action: checkout },
    // { label: "y", description: "Checkout pull-request", action: checkout },
    // { label: "s", description: "Create new spin-off", action: createNewSpinoff },
    { label: 'n', description: 'Create new branch', action: createNewBranch },
    // { label: "W", description: "Create new worktree", action: checkout },
    // { label: "Y", description: "Create from pull-request", action: checkout },
    // { label: 'C', description: 'Configure', action: configureBranch },
    { label: 'm', description: 'Rename', action: renameBranch },
    { label: 'x', description: 'Reset', action: resetBranch },
    { label: 'k', description: 'Delete', action: deleteBranch },
  ]
};

export async function branching(repository: MagitRepository) {
  return MenuUtil.showMenu(branchingMenu, { repository });
}

export async function showRefs(repository: MagitRepository) {
  const uri = ShowRefsView.encodeLocation(repository);

  if (!views.has(uri.toString())) {
    views.set(uri.toString(), new ShowRefsView(uri, repository.magitState!));
  }

  return workspace.openTextDocument(uri)
    .then(doc => window.showTextDocument(doc, { preview: false }));
}

async function checkout(menuState: MenuState) {
  return _checkout(menuState, menuState.repository.state.refs);
}

async function checkoutLocal(menuState: MenuState) {
  return _checkout(menuState, menuState.repository.state.refs.filter(r => r.type === RefType.Head));
}

async function checkoutNewBranch(menuState: MenuState) {
  return _createBranch(menuState, true);
}

async function createNewBranch(menuState: MenuState) {
  return _createBranch(menuState, false);
}

// async function configureBranch(menuState: MenuState) {

//   // 1. Select branch? or grab current?
//   // 2. Read all configs: menuState.repository.getConfigs
//   //    already exist in repo state?
//   // 3. repository.setConfig("branch.${ref}.someProperty")
// }

async function renameBranch({ repository }: MenuState) {

  const ref = await MagitUtils.chooseRef(repository, 'Rename branch', true, false, false);

  if (ref) {
    const newName = await window.showInputBox({ prompt: `Rename branch '${ref}' to:` });

    if (newName && newName.length > 0) {

      const args = ['branch', '--move', ref, newName];
      return gitRun(repository, args);

    } else {
      throw new Error('No name given for branch rename');
    }
  }
}

async function deleteBranch({ repository }: MenuState) {

  const ref = await MagitUtils.chooseRef(repository, 'Delete', false, false, false);

  if (ref) {
    try {
      await repository.deleteBranch(ref, false);
    } catch (error) {
      if (error.gitErrorCode === GitErrorCodes.BranchNotFullyMerged) {
        if (await MagitUtils.confirmAction(`Delete unmerged branch ${ref}?`)) {
          return repository.deleteBranch(ref, true);
        }
      }
    }
  }
}

async function resetBranch({ repository }: MenuState) {

  const ref = await MagitUtils.chooseRef(repository, 'Reset branch', true, false, false);

  const resetToRef = await MagitUtils.chooseRef(repository, `Reset ${ref} to`);

  if (ref && resetToRef) {

    if (ref === repository.magitState?.HEAD?.name) {

      const args = ['reset', '--hard', resetToRef];
      if (MagitUtils.magitAnythingModified(repository)) {

        if (await MagitUtils.confirmAction(`Uncommitted changes will be lost. Proceed?`)) {
          return await gitRun(repository, args);
        }
      } else {
        return await gitRun(repository, args);
      }
    } else {
      const args = ['update-ref', `refs/heads/${ref}`, `refs/heads/${resetToRef}`];
      return gitRun(repository, args);
    }
  }
}

async function _checkout({ repository }: MenuState, refs: Ref[]) {

  const ref = await MagitUtils.chooseRef(repository, 'Checkout');

  if (ref) {
    const args = ['checkout', ref];
    return gitRun(repository, args);
  }
}

async function _createBranch({ repository }: MenuState, checkout: boolean) {

  const ref = await MagitUtils.chooseRef(repository, 'Create and checkout branch starting at', true, true);

  if (ref) {
    // Check if the branch is a remote branch
    const remoteBranchRef = repository.state.refs.find(r => r.type === RefType.RemoteHead && r.name === ref);
    let value = '';
    if (remoteBranchRef && remoteBranchRef.remote) {
      const localBranchName = ref.substring(remoteBranchRef.remote.length + 1);
      const existLocally = repository.state.refs.find(r => r.type === RefType.Head && r.name === localBranchName);
      if (!existLocally) {
        // Populate the inputbox with a local branch name if it doesn't exist locally
        value = localBranchName;
      }
    }

    const newBranchName = await window.showInputBox({ prompt: 'Name for new branch', value: value });

    if (newBranchName && newBranchName.length > 0) {

      return repository.createBranch(newBranchName, checkout, ref);

    } else {
      throw new Error('No name given for new branch');
    }
  }
}
