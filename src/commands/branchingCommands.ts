import { window } from "vscode";
import { Menu, MenuState, MenuUtil } from "../menu/menu";
import { MagitRepository } from "../models/magitRepository";
import { Ref } from "../typings/git";
import { DocumentView } from "../views/general/documentView";
import { gitRun } from "../utils/gitRawRunner";
import MagitUtils from "../utils/magitUtils";

const branchingMenu = {
  title: "Branching",
  commands: [
    { label: "b", description: "Checkout", action: checkout },
    { label: "l", description: "Checkout local branch", action: checkoutLocal },
    { label: "c", description: "Checkout new branch", action: checkoutNewBranch },
    // { label: "w", description: "Checkout new worktree", action: checkout },
    // { label: "y", description: "Checkout pull-request", action: checkout },
    // { label: "s", description: "Create new spin-off", action: createNewSpinoff },
    { label: "n", description: "Create new branch", action: createNewBranch },
    // { label: "W", description: "Create new worktree", action: checkout },
    // { label: "Y", description: "Create from pull-request", action: checkout },
    { label: "C", description: "Configure", action: configureBranch },
    { label: "m", description: "Rename", action: renameBranch },
    { label: "x", description: "Reset", action: resetBranch },
    { label: "k", description: "Delete", action: deleteBranch },
  ]
};

export async function branching(repository: MagitRepository, currentView: DocumentView) {
  // commands.executeCommand('setContext', 'magit.branching', true);
  return MenuUtil.showMenu(branchingMenu, { repository, currentView });
}

async function checkout(menuState: MenuState) {
  return _checkout(menuState, menuState.repository.state.refs);
}

async function checkoutLocal(menuState: MenuState) {
  return _checkout(menuState, menuState.repository.state.refs);
}

async function checkoutNewBranch(menuState: MenuState) {
  return _createBranch(menuState, true);
}

async function createNewBranch(menuState: MenuState) {
  return _createBranch(menuState, false);
}

// async function createNewSpinoff(menuState: MenuState) {

//   // Spinoff command
//   //  C-h F magit-branch-spinoff

//   // e.g:
//   //  on branch master:
//   //  1. Remove all unpublished commits
//   //  2. checkout new branch with input name
//   //  3. Add all the unpublished/now removed commits from master to $NEW_BRANCH
// }

async function configureBranch(menuState: MenuState) {

  // 1. Select branch? or take current?
  // 2. Read all configs: menuState.repository.getConfigs
  //    maybe they are already read in the repo state?
  // 3. repository.setConfig("branch.${ref}.theCoolProperty")
}

async function renameBranch({ repository, currentView }: MenuState) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Rename branch" });

  if (ref) {
    let newName = await window.showInputBox({ prompt: `Rename branch '${ref}' to:` });

    if (newName && newName.length > 0) {

      const args = ["branch", "--move", ref, newName];
      return gitRun(repository, args);

    } else {
      throw new Error("No name given for branch rename");
    }
  }
}

async function deleteBranch({ repository, currentView }: MenuState) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Delete" });

  let force = false;

  // TODO: delete branch unmerged check
  // If unmerged
  // repository.getMergeBase()

  //    git branch --no-merged ??? master
  //  How: maybe try deleting and check the error response for "not fully merged"?
  let confirmed = await window.showInputBox({ prompt: `Delete unmerged branch ${ref}?` });
  if (confirmed !== undefined) {
    force = true;
  }

  if (ref) {
    return repository.deleteBranch(ref, force);
  }
}

async function resetBranch({ repository, currentView }: MenuState) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Reset branch" });

  let resetToRef = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: `Reset ${ref} to` });

  if (ref && resetToRef) {

    if (ref === repository.magitState?.HEAD?.name) {

      if (MagitUtils.magitAnythingModified(repository)) {

        let confirmed = await window.showInputBox({ prompt: `Uncommitted changes will be lost. Proceed? (yes or no)` });
        if (confirmed?.toLowerCase() !== 'yes') {
          return;
        }
      }
      repository._repository.reset(resetToRef, true);

    } else {
      const args = ["update-ref", `refs/heads/${ref}`, `refs/heads/${resetToRef}`];
      return gitRun(repository, args);
    }
  }
}

async function _checkout({ repository, currentView }: MenuState, refs: Ref[]) {

  let ref = await window.showQuickPick(refs.map(r => r.name!), { placeHolder: "Checkout" });

  if (ref) {
    return repository.checkout(ref);
  }
}

async function _createBranch({ repository, currentView }: MenuState, checkout: boolean) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Create and checkout branch starting at" });

  if (ref) {
    let newBranchName = await window.showInputBox({ prompt: "Name for new branch" });

    if (newBranchName && newBranchName.length > 0) {

      return repository.createBranch(newBranchName, checkout, ref);

    } else {
      window.showErrorMessage("No name given for new branch");
    }
  }
}