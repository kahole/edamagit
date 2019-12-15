import MagitUtils from "../utils/magitUtils";

export class CommandPrimer {

  // TODO: make type safe, with the function input.
  //    might not need the variables based on the type signature of the function

  static prime(command: Function, needsView?: boolean, needsSelectedView?: boolean) {

    if (needsView) {
      return () => {
        let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

        if (currentView) {
          command(repository, currentView);
        }
      };
    } else {
      return () => {
        let repository = MagitUtils.getCurrentMagitRepo();

        if (repository) {
          command(repository);
        }
      };
    }
  }
}