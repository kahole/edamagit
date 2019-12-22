import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window, TextEditor, TextDocument } from "vscode";
import MagitStatusView from "../views/magitStatusView";
import { internalMagitStatus } from "../commands/statusCommands";
import { DocumentView } from "../views/general/documentView";

export default class MagitUtils {
  public static getCurrentMagitRepo(document: TextDocument): MagitRepository | undefined {
    return magitRepositories.get(document.uri.query);
  }

  public static getCurrentMagitRepoAndView(editor: TextEditor): [MagitRepository | undefined, DocumentView | undefined] {
    let repository = magitRepositories.get(editor.document.uri.query);
    let currentView = repository?.views?.get(editor.document.uri.toString() ?? "") as DocumentView;
    return [repository, currentView];
  }

  public static magitStatusAndUpdate(repository: MagitRepository, view: DocumentView) {
    internalMagitStatus(repository)
      .then(() => view.triggerUpdate());
  }
}