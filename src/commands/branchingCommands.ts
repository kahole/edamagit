import { window } from "vscode";
import { Menu, MenuState, MenuUtil } from "../menu/menu";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";
import { Ref } from "../typings/git";

const branchingMenu = {
  title: "Branching",
  commands: [
    { label: "b", description: "Checkout", action: checkout },
    { label: "l", description: "Checkout local branch", action: checkoutLocal },
    { label: "c", description: "Checkout new branch", action: checkoutNewBranch },
    // { label: "w", description: "Checkout new worktree", action: checkout },
    // { label: "y", description: "Checkout pull-request", action: checkout },
    { label: "s", description: "Create new spin-off", action: createNewSpinoff },
    { label: "n", description: "Create new branch", action: createNewBranch },
    // { label: "W", description: "Create new worktree", action: checkout },
    // { label: "Y", description: "Create from pull-request", action: checkout },
    { label: "C", description: "Configure", action: checkout },
    { label: "m", description: "Rename", action: renameBranch },
    { label: "x", description: "Reset", action: resetBranch },
    { label: "k", description: "Delete", action: deleteBranch },
  ]
};

export async function branching(repository: MagitRepository, currentView: MagitStatusView) {
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

async function createNewSpinoff(menuState: MenuState) {
  await _createBranch(menuState, true);
  // await menuState.repository.setBranchUpstream("nameOfNewBranch", "nameOfOldBranch that should be tracked");

  // TODO:
  //  C-h F magit-branch-spinoff
}

async function renameBranch({ repository, currentView }: MenuState) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Rename branch" });

  if (ref) {
    let newName = await window.showInputBox({ prompt: `Rename branch '${ref}' to:` });

    if (newName && newName.length > 0) {

      // TODO: denne kan kun rename current branch
      return await repository._repository.renameBranch(newName);

    } else {
      throw new Error("No name given for branch rename");
    }
  }
}

async function deleteBranch({ repository, currentView }: MenuState) {

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Delete" });

  let force = false;

  // TODO:
  // If unmerged
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

  // TODO

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Rename branch" });

  let resetToRef = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Rename branch" });

  if (ref) {
    // repository._repository.reset()
  }
}

//--------------------------------

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