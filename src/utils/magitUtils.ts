import { MagitRepository } from '../models/magitRepository';
import { magitRepositories, views } from '../extension';
import { TextEditor, TextDocument, window, ViewColumn } from 'vscode';
import { internalMagitStatus } from '../commands/statusCommands';
import { DocumentView } from '../views/general/documentView';
import MagitStatusView from '../views/magitStatusView';

export default class MagitUtils {
  public static getCurrentMagitRepo(document: TextDocument): MagitRepository | undefined {
    return magitRepositories.get(document.uri.query);
  }

  public static getCurrentMagitRepoAndView(editor: TextEditor): [MagitRepository | undefined, DocumentView | undefined] {
    const repository = magitRepositories.get(editor.document.uri.query);
    const currentView = views.get(editor.document.uri.toString() ?? '') as DocumentView;
    return [repository, currentView];
  }

  public static async magitStatusAndUpdate(repository: MagitRepository, view: DocumentView) {

    await internalMagitStatus(repository);

    // TODO: Update other kinds of views as well?

    // Update all open views for a given repository?

    views.set(view.uri.toString(), new MagitStatusView(view.uri, repository.magitState!));
    view.triggerUpdate();

    // let statusView: MagitStatusView | undefined;

    // views.forEach((v) => {
    //   if (v instanceof MagitStatusView) {
    //     statusView = v;
    //   }
    // });

    // if (statusView) {
    //   views.set(statusView.uri.toString(), new MagitStatusView(statusView.uri, repository.magitState!));
    //   statusView.triggerUpdate();
    // }
  }

  public static magitAnythingModified(repository: MagitRepository): boolean {
    return repository.magitState !== undefined && (
      repository.magitState.indexChanges.length > 0 ||
      repository.magitState.workingTreeChanges.length > 0 ||
      (repository.magitState.mergeChanges?.length ?? 0) > 0);
  }

  public static async confirmAction(prompt: string, hardConfirm: boolean = false) {

    // MINOR: maybe just have the vscode confirm Enter, cancel Escape prompt?
    const yesNo = hardConfirm ? 'yes or no' : 'y or n';
    const confirmed = await window.showInputBox({ prompt: `${prompt} (${yesNo})` });
    if ((hardConfirm && confirmed?.toLowerCase() === 'yes') || (!hardConfirm && confirmed?.toLowerCase().charAt(0) === 'y')) {
      return true;
    }
    window.setStatusBarMessage('Abort');
    return false;
  }

  public static oppositeActiveViewColumn(): ViewColumn {
    if (window.activeTextEditor?.viewColumn ?? 0 > ViewColumn.One) {
      return ViewColumn.One;
    }
    return ViewColumn.Two;
  }
}