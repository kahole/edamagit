import * as vscode from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { magitRepositories, views, gitApi } from '../extension';
import { window, ViewColumn, Uri, commands } from 'vscode';
import { internalMagitStatus } from '../commands/statusCommands';
import { DocumentView } from '../views/general/documentView';
import FilePathUtils from './filePathUtils';
import { RefType, Repository } from '../typings/git';
import { PickMenuItem, PickMenuUtil } from '../menu/pickMenu';
import GitTextUtils from '../utils/gitTextUtils';
import * as Constants from '../common/constants';

export default class MagitUtils {

  public static getMagitRepoThatContainsFile(uri: Uri): MagitRepository | undefined {

    let discoveredRepos = Array.from(magitRepositories.entries());

    let reposContainingFile = discoveredRepos
      .filter(([path, repo]) => FilePathUtils.isDescendant(path, uri.fsPath));

    if (reposContainingFile.length > 0 && discoveredRepos.length >= gitApi.repositories.length) {
      return reposContainingFile.sort(([pathA, repoA], [pathB, repoB]) => pathB.length - pathA.length)[0][1];
    }

    // First time encountering this repo
    return gitApi.repositories.find(r => FilePathUtils.isDescendant(r.rootUri.fsPath, uri.fsPath));
  }

  public static async getCurrentMagitRepo(uri?: Uri): Promise<MagitRepository | undefined> {

    let repository;

    if (uri) {
      repository = magitRepositories.get(uri.query);
    }

    if (!repository) {

      if (uri) {
        repository = this.getMagitRepoThatContainsFile(uri);
      }

      // Can't deduce a repo from uri, ask user to choose
      if (!repository) {

        if (gitApi.repositories.length === 1) {
          repository = gitApi.repositories[0];
        }
        else if (gitApi.repositories.length) {

          if (vscode.workspace.workspaceFolders?.length) {
            repository = this.getMagitRepoThatContainsFile(vscode.workspace.workspaceFolders[0].uri);
          }

          if (!repository) {
            const repoPicker: PickMenuItem<Repository | undefined>[] = gitApi.repositories.map(repo => ({ label: repo.rootUri.fsPath, meta: repo }));
            repoPicker.push({ label: 'Init repo', meta: undefined });
            repository = await PickMenuUtil.showMenu(repoPicker, 'Which repository?');
          }
        }

        if (!repository) {
          const newRepo = await commands.executeCommand('git.init');

          await new Promise(r => setTimeout(r, 1000));

          if (gitApi.repositories.length) {
            repository = gitApi.repositories[0];
          }
        }
      }

      if (repository) {
        magitRepositories.set(repository.rootUri.fsPath, repository);
      }
    }

    return repository;
  }

  public static getCurrentMagitRepoAndView(uri: Uri): [MagitRepository | undefined, DocumentView | undefined] {
    const repository = magitRepositories.get(uri.query);
    const currentView = views.get(uri.toString() ?? '') as DocumentView;
    return [repository, currentView];
  }

  public static async magitStatusAndUpdate(repository: MagitRepository) {
    await internalMagitStatus(repository);
    views.forEach(view => view.needsUpdate ? view.update(repository.magitState!) : undefined);
  }

  public static magitAnythingModified(repository: MagitRepository): boolean {
    return repository.magitState !== undefined && (
      repository.magitState.indexChanges.length > 0 ||
      repository.magitState.workingTreeChanges.length > 0 ||
      (repository.magitState.mergeChanges?.length ?? 0) > 0);
  }

  public static async chooseRef(repository: MagitRepository, prompt: string, showCurrent = false, showHEAD = false, allowFreeform = true): Promise<string> {

    const refs: PickMenuItem<string>[] = [];

    if (showCurrent && repository.magitState?.HEAD?.name) {
      refs.push({
        label: repository.magitState.HEAD.name,
        description: GitTextUtils.shortHash(repository.magitState.HEAD.commit),
        meta: repository.magitState.HEAD.name
      });
    }

    if (showHEAD) {
      refs.push({
        label: 'HEAD',
        description: GitTextUtils.shortHash(repository.magitState?.HEAD?.commit),
        meta: 'HEAD'
      });
    }

    refs.push(...repository.state.refs
      .filter(ref => ref.name !== repository.magitState?.HEAD?.name)
      .sort((refA, refB) => refA.type - refB.type).map(r => ({
        label: r.name!,
        description: GitTextUtils.shortHash(r.commit),
        meta: r.name!
      })));

    if (allowFreeform) {
      return PickMenuUtil.showMenuWithFreeform(refs, prompt);
    } else {
      return PickMenuUtil.showMenu(refs, prompt);
    }
  }

  public static async chooseCommit(repository: MagitRepository, prompt: string): Promise<string> {

    const commitPicker = repository.magitState?.log.map(commit => ({
      label: GitTextUtils.shortHash(commit.hash),
      description: commit.message.concat(' ').concat(commit.hash),
      meta: commit.hash
    })) ?? [];

    return PickMenuUtil.showMenuWithFreeform(commitPicker, prompt);
  }

  public static async chooseTag(repository: MagitRepository, prompt: string) {
    const refs = repository.state.refs
      .filter(ref => ref.type === RefType.Tag)
      .map(r => r.name!);

    return window.showQuickPick(refs, { placeHolder: prompt });
  }

  public static async confirmAction(prompt: string, hardConfirm: boolean = false) {

    const yesNo = hardConfirm ? 'yes or no' : 'y or n';
    const confirmed = await window.showInputBox({ prompt: `${prompt} (${yesNo})` });
    if ((hardConfirm && confirmed?.toLowerCase() === 'yes') || (!hardConfirm && confirmed?.toLowerCase().charAt(0) === 'y')) {
      return true;
    }
    window.setStatusBarMessage('Abort', Constants.StatusMessageDisplayTimeout);
    return false;
  }

  public static showDocumentColumn(): ViewColumn {
    const activeColumn = window.activeTextEditor?.viewColumn ?? 0;

    if (vscode.workspace.getConfiguration('magit').get('display-buffer-function') === 'same-column') {
      return activeColumn;
    }

    if (activeColumn > ViewColumn.One) {
      return ViewColumn.One;
    }
    return ViewColumn.Two;
  }
}