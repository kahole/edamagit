import { window, commands } from "vscode";
import { Menu, MenuState } from "../menu/menu";
import { MagitRepository } from "../models/magitRepository";
import MagitUtils from "../utils/magitUtils";
import MagitStatusView from "../views/magitStatusView";
import { Ref } from "../typings/git";

export async function branching(repository: MagitRepository, currentView: MagitStatusView, switches: any = {}) {

  // commands.executeCommand('setContext', 'magit.branching', true);
  
  Menu.showMenu(branchingMap, { repository, currentView });
}

const branchingMap = [
  { label: "b", description: "$(git-branch) Checkout", action: checkout },
  { label: "l", description: "Checkout local branch", action: checkoutLocal },
  { label: "c", description: "Checkout new branch", action: checkoutNewBranch },
  { label: "w", description: "Checkout new worktree", action: checkout },
  { label: "y", description: "Checkout pull-request", action: checkout },
  { label: "s", description: "Create new spin-off", action: createNewSpinoff },
  { label: "n", description: "Create new branch", action: createNewBranch },
  { label: "W", description: "Create new worktree", action: checkout },
  { label: "Y", description: "Create from pull-request", action: checkout },
  { label: "C", description: "Configure", action: checkout },
  { label: "m", description: "Rename", action: renameBranch },
  { label: "x", description: "Reset", action: checkout },
  { label: "k", description: "Delete", action: deleteBranch },
];

async function checkout(menuState: MenuState) {
  _checkout(menuState, menuState.repository.state.refs);
}

async function checkoutLocal(menuState: MenuState) {
  _checkout(menuState, menuState.repository.state.refs);
}

async function checkoutNewBranch(menuState: MenuState) {
  _createBranch(menuState, true);
}

async function createNewBranch(menuState: MenuState) {
  _createBranch(menuState, false);
}

async function createNewSpinoff(menuState: MenuState) {
  await _createBranch(menuState, true);
  // await menuState.repository.setBranchUpstream("nameOfNewBranch", "nameOfOldBranch that should be tracked");

  // TODO:
  //  C-h F magit-branch-spinoff
}

async function renameBranch(menuState: MenuState) {

  let { repository, currentView } = menuState;

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Create and checkout branch starting at:" });
  
  if (ref) {
    let newName = await window.showInputBox({ prompt: `Rename branch '${ref}' to:` });

    if (newName && newName.length > 0) {
      try {
        // TODO: denne kan kun rename current branch
        await repository._repository.renameBranch(newName);
        MagitUtils.magitStatusAndUpdate(repository, currentView);
      } catch (error) {
        window.showErrorMessage(error.stderr);
      }
    } else {
      window.showErrorMessage("No name given");
    }
  }
}

async function deleteBranch(menuState: MenuState) {

  let { repository, currentView } = menuState;

  // TODO: menu-title
  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Delete" });

  // TODO
  let force = false;

  if (ref) {
    try {
      await repository.deleteBranch(ref, force);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {
      window.showErrorMessage(error.stderr);
    }
  }
}

//--------------------------------

async function _checkout(menuState: MenuState, refs: Ref[]) {

  let { repository, currentView } = menuState;

  // TODO: menu-title
  let ref = await window.showQuickPick(refs.map(r => r.name!), { placeHolder: "Checkout" });

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {
      window.showErrorMessage(error.stderr);
    }
  }
}

async function _createBranch(menuState: MenuState, checkout: boolean) {

  let { repository, currentView } = menuState;
  
  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Create and checkout branch starting at:" });
  
  if (ref) {
    let newBranchName = await window.showInputBox({ prompt: "Name for new branch" });

    if (newBranchName && newBranchName.length > 0) {

      try {
        await repository.createBranch(newBranchName, checkout, ref);
        MagitUtils.magitStatusAndUpdate(repository, currentView);
      } catch (error) {
        window.showErrorMessage(error.stderr);
      }
    } else {
      window.showErrorMessage("No name given for new branch");
    }
  }
}