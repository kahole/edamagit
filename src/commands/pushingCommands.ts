import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import { commands } from "vscode";
import { DocumentView } from "../views/general/documentView";

export async function pushing(repository: MagitRepository, currentView: DocumentView) {

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
}

async function pushToPushRemote() {

}

async function pushUpstream() {
  return commands.executeCommand("git.push");
}

async function pushElsewhere() {

}