import { MagitPicker } from "../menus/magitPicker";
import { PushingMenu } from "../menus/pushing/pushingMenu";
import MagitUtils from "../utils/magitUtils";

export function pushing() {

  let currentRepository = MagitUtils.getCurrentMagitRepo();

  if (currentRepository) {
    console.log("Working tree changes, but from pushing command");
    console.log(currentRepository.magitState!.workingTreeChanges);

    MagitPicker.showMagitPicker(new PushingMenu());

    // Hvordan git push kommandoen bygges opp:
    // https://github.com/microsoft/vscode/blob/master/extensions/git/src/git.ts#L1491

    // kun "git push" slik den står nå
    currentRepository._repository.pushTo()
      .then(() => console.log("klarte å pushe ?"))
      .catch(console.log);
  }

  // _repository pushTo(remote?: string, name?: string, setUpstream?: boolean, forcePushMode?: ForcePushMode): Promise<void>

  // currentRepository.push()
  //  .then(
  //     display success message in status area, or info box
  //  )
  //  .catch(
  //        handleError somehow
}