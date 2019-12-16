import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";

export class CommandPrimer {

  static primeRepo(command: (repository: MagitRepository) => Promise<void>) {
    return () => {
      let repository = MagitUtils.getCurrentMagitRepo();

      if (repository) {
        command(repository);
      }
    };
  }

  static primeRepoAndView(command: (repository: MagitRepository, view: MagitStatusView) => Promise<void>, needsSelectedView?: boolean) {

    return () => {
      let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

      if (repository && currentView) {
        command(repository, currentView);
      }
    };
  }
}