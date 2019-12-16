import { window, commands } from "vscode";
import { Menu } from "../menu/menu";
import { MagitRepository } from "../models/magitRepository";
import MagitUtils from "../utils/magitUtils";
import MagitStatusView from "../views/magitStatusView";

export async function branchingOld(repository: MagitRepository, currentView: MagitStatusView) {

  // let branchingMenuOutput = await MagitPicker.showMagitPicker(new BranchingMenu());

  // switch (branchingAction) {
  //   case BranchingMenuItem.Checkout:

  //     break;

  //   default:
  //     break;
  // }

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!));

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {
      window.showErrorMessage(error.stderr);
    }
  }
}

// TODO: Vanskeligste
// SIDETRACK!
// Kan transient løses bedre med dynamic commands somehow?
// HER: https://stackoverflow.com/questions/58483907/how-to-add-the-custom-when-clause-in-vs-code
//   vscode.commands.executeCommand('setContext', 'myContext', `value`);
//     when: myContext == value

// TODO
// LøST:
// {
//   "command": "extension.magit-checkout",
//   "key": "c",
//   "when": "inQuickOpen && branching == true"
// }
// QuickPick blir da bare en visuell hjelpe-popup!
//       da blir den context-aware begrensinger av kommandoer visuell (til å begynne med i hvertfall)
//    også for å velge branches og switches etc!


export async function branching(repository: MagitRepository, currentView: MagitStatusView, switches: any = {}) {

  commands.executeCommand('setContext', 'magitBranching', true);

  let menu = new Menu(branchingMap, false, repository, currentView);
  menu.show();
}

const branchingMap = [
  { label: "b", description: "$(git-branch) Checkout", action: checkout },
  { label: "l", description: "Checkout local branch", action: checkout  },
  { label: "c", description: "Checkout new branch", action: checkout  },
  { label: "w", description: "Checkout new worktree", action: checkout  },
  { label: "y", description: "Checkout pull-request", action: checkout  },
  { label: "s", description: "Create new spin-off", action: checkout  },
  { label: "n", description: "Create new branch", action: checkout  },
  { label: "W", description: "Create new worktree", action: checkout  },
  { label: "Y", description: "Create from pull-request", action: checkout  },
  { label: "C", description: "Configure", action: checkout  },
  { label: "m", description: "Rename", action: checkout  },
  { label: "x", description: "Reset", action: checkout  },
  { label: "k", description: "Delete", action: checkout  },
];

async function checkout(repository: MagitRepository, currentView: MagitStatusView) {

  // TODO: menu-title
  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: "Checkout" });

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {

    }
  }
}
