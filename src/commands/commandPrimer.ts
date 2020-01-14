import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { TextEditor, window } from 'vscode';
import { DocumentView } from '../views/general/documentView';

export class CommandPrimer {

  // static primeRepo(command: (repository: MagitRepository) => Promise<void>) {
  //   return (editor: TextEditor) => {
  //     let repository = MagitUtils.getCurrentMagitRepo(editor.document);

  //     if (repository) {
  //       command(repository);
  //     }
  //   };
  // }

  static primeRepoAndView(command: (repository: MagitRepository, view: DocumentView) => Promise<void>, needsUpdate: boolean = true): (editor: TextEditor) => Promise<void> {

    return async (editor: TextEditor) => {
      const [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView(editor);

      if (repository && currentView) {

        try {
          await command(repository, currentView);
          if (needsUpdate) {
            MagitUtils.magitStatusAndUpdate(repository, currentView);
          }
        } catch (error) {
          if (error.gitErrorCode) {
            // This needs to be cleared somehow as well?
            // Maybe it gets removed once it is rendered. So next render will not have it?
            // e.g:  GitError! Your local changes to the following files would be overwritten by checkout
            repository.magitState!.latestGitError = error.stderr ?? error.message;
          } else {
            // This error type, too heavy for most errors?
            //   statusBar message might be better
            //   but then custom, shorter messages are needed
            window.showErrorMessage(error.stderr ?? error.message);
          }
        }
      }
    };
  }
}