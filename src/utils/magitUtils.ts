import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window } from "vscode";
import { View } from "../views/general/view";
import MagitStatusView from "../views/magitStatusView";
import { internalMagitStatus } from "../commands/statusCommands";

export default class MagitUtils {
  public static getCurrentMagitRepo(): MagitRepository | undefined {
    if (window.activeTextEditor) {
      return magitRepositories[window.activeTextEditor.document.uri.query];
    }
  }

  public static getCurrentMagitRepoAndView(): [MagitRepository | undefined, MagitStatusView | undefined] {
    let repository = MagitUtils.getCurrentMagitRepo();
    // TODO: clean up, always MagitStatus view?
    //     how should other views be handled
    let currentView = repository?.views?.get(window.activeTextEditor?.document.uri.toString() ?? "") as MagitStatusView;
    return [repository, currentView];
  }

  public static magitStatusAndUpdate(repository: MagitRepository, statusView: MagitStatusView) {
      internalMagitStatus(repository)
      .then(() => statusView.triggerUpdate());
  }
}