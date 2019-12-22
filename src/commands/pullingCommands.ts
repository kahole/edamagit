import { MagitRepository } from "../models/magitRepository";
import { DocumentView } from "../views/general/documentView";
import { MenuItem } from "../menu/menuItem";
import { MenuUtil } from "../menu/menu";
import { commands } from "vscode";

export async function pulling(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  let pullingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    pullingMenuItems.push({ label: "p", description: `${pushRemote.remote}/${pushRemote.name}`, action: pullFromPushRemote });
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    pullingMenuItems.push({ label: "u", description: `${upstream.remote}/${upstream.name}`, action: pullFromUpstream });
  }

  pullingMenuItems.push({ label: "e", description: "elsewhere", action: pullFromElsewhere });

  return MenuUtil.showMenu({ title: "Pulling", commands: pullingMenuItems }, { repository, currentView });
}

function pullFromPushRemote() {

}

function pullFromUpstream() {
  // TODO: this pulls every branch by default!
  return commands.executeCommand("git.pull");
}

function pullFromElsewhere() {
  return commands.executeCommand("git.pullFrom");
}