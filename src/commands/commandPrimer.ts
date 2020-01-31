import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { TextEditor, window } from 'vscode';
import { DocumentView } from '../views/general/documentView';

export class Command {

  // static primeRepo(command: (repository: MagitRepository) => Promise<void>) {
  //   return (editor: TextEditor) => {
  //     let repository = MagitUtils.getCurrentMagitRepo(editor.document);

  //     if (repository) {
  //       command(repository);
  //     }
  //   };
  // }

  static primeRepoAndView(command: (repository: MagitRepository, view: DocumentView) => Promise<void>, triggersUpdate: boolean = true): (editor: TextEditor) => Promise<void> {

    return async (editor: TextEditor) => {
      const [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView(editor);

      if (repository && currentView) {

        try {
          await command(repository, currentView);
        } catch (error) {
          if (error.gitErrorCode) {
            repository.magitState!.latestGitError = error.stderr ?? error.message;
          } else {
            // This error type, too heavy for most errors?
            //   statusBar message might be better
            //   but then custom, shorter messages are needed
            window.showErrorMessage(error.stderr ?? error.message);
          }
        } finally {
          if (triggersUpdate) {
            MagitUtils.magitStatusAndUpdate(repository, currentView);
          }
        }
      }
    };
  }
}