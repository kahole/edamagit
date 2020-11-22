import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { TextEditor, window, Uri } from 'vscode';
import { DocumentView } from '../views/general/documentView';
import GitTextUtils from '../utils/gitTextUtils';
import { MagitError } from '../models/magitError';

type Command = (repository: MagitRepository) => Promise<any>;
type ViewCommand = (repository: MagitRepository, view: DocumentView) => Promise<any>;
type FileCommand = (repository: MagitRepository, fileUri: Uri) => Promise<any>;

export class CommandPrimer {

  static primeRepo(command: Command, triggersUpdate: boolean = true): (editor: TextEditor) => Promise<any> {

    return async (editor: TextEditor) => {
      const repository = await MagitUtils.getCurrentMagitRepo(editor.document.uri);

      if (repository) {
        try {
          await command(repository);
        } catch (error) {
          this.handleError(repository, error);
        } finally {
          if (triggersUpdate) {
            await MagitUtils.magitStatusAndUpdate(repository);
          }
        }
      }
    };
  }

  static primeRepoAndView(command: ViewCommand, triggersUpdate: boolean = true): (editor: TextEditor) => Promise<any> {

    return async (editor: TextEditor) => {
      const [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView(editor.document.uri);

      if (repository && currentView) {
        try {
          await command(repository, currentView);
        } catch (error) {
          this.handleError(repository, error);
        } finally {
          if (triggersUpdate) {
            await MagitUtils.magitStatusAndUpdate(repository);
          }
        }
      }
    };
  }

  static primeFileCommand(command: FileCommand, triggersUpdate: boolean = true): (editor: TextEditor) => Promise<any> {
    return async (editor: TextEditor) => {

      const fileUri = editor.document.uri;
      const repository = await MagitUtils.getCurrentMagitRepo(fileUri);

      if (repository) {
        try {
          await command(repository, fileUri);
        } catch (error) {
          this.handleError(repository, error);
        } finally {
          if (triggersUpdate) {
            await MagitUtils.magitStatusAndUpdate(repository);
          }
        }
      }
    };
  }

  static handleError(repository: MagitRepository, error: any) {

    if (error.gitErrorCode || error.stderr || error instanceof MagitError) {
      pushLatestGitError(repository, GitTextUtils.formatError(error));
    } else {
      //   using statusBar message might be better
      //   but then custom, shorter messages are needed
      window.showErrorMessage(GitTextUtils.formatError(error));
      console.error(error);
    }
  }
}

let latestGitErrorCache = new Map<string, string>();
function pushLatestGitError(repository: MagitRepository, error: string) {
  latestGitErrorCache.set(repository.uri.fsPath, error);
}
export function getLatestGitError(repository: MagitRepository): string | undefined {
  let error = latestGitErrorCache.get(repository.uri.fsPath);
  latestGitErrorCache.delete(repository.uri.fsPath);
  return error;
}