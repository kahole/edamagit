import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";
import { TextEditor } from "vscode";

export class CommandPrimer {

  static primeRepo(command: (repository: MagitRepository) => Promise<void>) {
    return (editor: TextEditor) => {
      let repository = MagitUtils.getCurrentMagitRepo(editor.document);

      if (repository) {
        command(repository);
      }
    };
  }

  static primeRepoAndView(command: (repository: MagitRepository, view: MagitStatusView) => Promise<void>): (editor: TextEditor) => void {

    return (editor: TextEditor) => {
      let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView(editor);

      if (repository && currentView) {
        command(repository, currentView);
      }
    };
  }
}