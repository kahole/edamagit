import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window, TextEditor, TextDocument } from "vscode";
import MagitStatusView from "../views/magitStatusView";
import { internalMagitStatus } from "../commands/statusCommands";

export default class MagitUtils {
  public static getCurrentMagitRepo(document: TextDocument): MagitRepository | undefined {
    return magitRepositories[document.uri.query];
  }

  public static getCurrentMagitRepoAndView(editor: TextEditor): [MagitRepository | undefined, MagitStatusView | undefined] {
    let repository = magitRepositories[editor.document.uri.query];
    // TODO: clean up, always MagitStatus view?
    //     how should other views be handled
    let currentView = repository?.views?.get(editor.document.uri.toString() ?? "") as MagitStatusView;
    return [repository, currentView];
  }

  public static magitStatusAndUpdate(repository: MagitRepository, statusView: MagitStatusView) {
      internalMagitStatus(repository)
      .then(() => statusView.triggerUpdate());
  }
}