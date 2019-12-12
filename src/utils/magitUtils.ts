import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window } from "vscode";
import { View } from "../views/abstract/view";
import MagitStatusView from "../views/magitStatusView";
import { internalMagitStatus } from "../commands/statusCommands";

export default class MagitUtils {
  public static getCurrentMagitRepo(): MagitRepository | undefined {
    if (window.activeTextEditor) {
      return magitRepositories[window.activeTextEditor.document.uri.query];
    }
  }

  public static getCurrentMagitRepoAndView(): [MagitRepository | undefined, View | undefined] {
    let repository = MagitUtils.getCurrentMagitRepo();
    let currentView = repository?.views?.get(window.activeTextEditor?.document.uri.toString() ?? "");
    return [repository, currentView];
  }

  public static maggitStatusAndUpdate(currentRepository: MagitRepository | undefined, statusView: View | undefined) {
    if (currentRepository && statusView instanceof MagitStatusView) {
      return () => internalMagitStatus(currentRepository)
      .then(() => statusView.triggerUpdate());
    }
  }
}