import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import { commands } from "vscode";
import { DocumentView } from "../views/general/documentView";
import { MenuItem } from "../menu/menuItem";
import { MenuUtil } from "../menu/menu";

export async function pushing(repository: MagitRepository, currentView: DocumentView) {

  let pushingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    pushingMenuItems.push({ label: "p", description: `${pushRemote.remote}/${pushRemote.name}`, action: pushToPushRemote });
  } else {
    // TODO: pushRemote, after setting that
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    pushingMenuItems.push({ label: "u", description: `${upstream.remote}/${upstream.name}`, action: pushUpstream });
  } else {
    // TODO: @{upstream}, after setting that
  }

  pushingMenuItems.push({ label: "e", description: "elsewhere", action: pushElsewhere });

  return MenuUtil.showMenu({ title: "Pushing", commands: pushingMenuItems }, { repository, currentView });
}

// TODO: important! can use vscode commands! commands.executeCommand("git.push !!

// Hvordan git push kommandoen bygges opp:
// https://github.com/microsoft/vscode/blob/master/extensions/git/src/git.ts#L1491

// kun "git push" slik den står nå
// currentRepository._repository.pushTo()
//   .then(() => console.log("klarte å pushe ?"))
//   .catch(console.log);


// _repository pushTo(remote?: string, name?: string, setUpstream?: boolean, forcePushMode?: ForcePushMode): Promise<void>

// currentRepository.push()
//  .then(
//     display success message in status area, or info box
//  )
//  .catch(
//        handleError somehow


async function pushToPushRemote() {

}

async function pushUpstream() {
  // This is probably correct
  return commands.executeCommand("git.push");
}

async function pushElsewhere() {
  return commands.executeCommand("git.pushTo");
}