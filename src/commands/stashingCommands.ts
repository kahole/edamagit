import { MagitRepository } from "../models/magitRepository";
import { DocumentView } from "../views/general/documentView";
import { MenuUtil } from "../menu/menu";
import { commands } from "vscode";

const stashingMenu = {
  title: "Branching",
  commands: [
    { label: "z", description: "Save", action: stash },
    //
    { label: "p", description: "Pop", action: popStash },
    { label: "a", description: "Apply", action: applyStash },
    { label: "k", description: "Drop", action: dropStash }
  ]
};

export async function stashing(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  return MenuUtil.showMenu(stashingMenu, { repository, currentView });
}

function stash() {
  return commands.executeCommand("git.stash");
}

function applyStash() {
  return commands.executeCommand("git.stashApply");
}

function dropStash() {
  return commands.executeCommand("git.stashDrop");
}

function popStash() {
  return commands.executeCommand("git.stashPop");
}