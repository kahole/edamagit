import { MagitRepository } from '../models/magitRepository';
import { magitRepositories, views, gitApi } from '../extension';
import { TextEditor, TextDocument, window, ViewColumn, workspace } from 'vscode';
import { internalMagitStatus } from '../commands/statusCommands';
import { DocumentView } from '../views/general/documentView';
import FilePathUtils from './filePathUtils';
import { Ref } from '../typings/git';

export default class MagitUtils {

  public static getCurrentMagitRepo(document: TextDocument): MagitRepository | undefined {

    let repository = magitRepositories.get(document.uri.query);

    if (!repository) {

      // MINOR: Any point in reusing repo from this map?
      for (const [key, repo] of magitRepositories.entries()) {
        if (FilePathUtils.isDescendant(key, document.uri.fsPath)) {
          return repo;
        }
      }

      // First time encountering this repo
      repository = gitApi.repositories.find(r => FilePathUtils.isDescendant(r.rootUri.fsPath, document.uri.fsPath));

      if (repository) {
        magitRepositories.set(repository.rootUri.fsPath, repository);
      }
    }

    return repository;
  }

  public static getCurrentMagitRepoAndView(editor: TextEditor): [MagitRepository | undefined, DocumentView | undefined] {
    const repository = magitRepositories.get(editor.document.uri.query);
    const currentView = views.get(editor.document.uri.toString() ?? '') as DocumentView;
    return [repository, currentView];
  }

  public static async magitStatusAndUpdate(repository: MagitRepository) {
    await internalMagitStatus(repository);
    views.forEach(view => view.needsUpdate ? view.update(repository) : undefined);
  }

  public static magitAnythingModified(repository: MagitRepository): boolean {
    return repository.magitState !== undefined && (
      repository.magitState.indexChanges.length > 0 ||
      repository.magitState.workingTreeChanges.length > 0 ||
      (repository.magitState.mergeChanges?.length ?? 0) > 0);
  }

  public static async chooseRef(repository: MagitRepository, prompt: string) {
    return window.showQuickPick(
      repository.state.refs
        .filter(ref => ref.name !== repository.magitState?.HEAD?.name)
        .sort((refA, refB) => refA.type - refB.type).map(r => r.name!)
      , { placeHolder: prompt });
  }

  public static async confirmAction(prompt: string, hardConfirm: boolean = false) {

    // MINOR: show dialog box? sometimes?
    // window.showInformationMessage("really?", { modal: true });

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
    const activeColumn = window.activeTextEditor?.viewColumn ?? 0;

    if (activeColumn > ViewColumn.One) {
      return ViewColumn.One;
    }
    return ViewColumn.Two;
  }
}