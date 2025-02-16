import * as vscode from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { magitRepositories, views, gitApi } from '../extension';
import { window, Uri, commands, workspace, RelativePattern } from 'vscode';
import * as Status from '../commands/statusCommands';
import { DocumentView } from '../views/general/documentView';
import FilePathUtils from './filePathUtils';
import { RefType, Repository } from '../typings/git';
import { PickMenuItem, PickMenuUtil } from '../menu/pickMenu';
import GitTextUtils from '../utils/gitTextUtils';
import * as Constants from '../common/constants';
import { getCommit } from './commitCache';

export interface Selection {
  key: string;
  description: string;
}

export default class MagitUtils {

  public static getMagitRepoThatContainsFile(uri: Uri): MagitRepository | undefined {

    let discoveredRepos = Array.from(magitRepositories.entries());

    let discoveredReposContainingFile = discoveredRepos
      .filter(([path, repo]) => FilePathUtils.isDescendant(path, uri.fsPath));

    // TODO: refactor
    if (discoveredRepos.length < gitApi.repositories.length) {
      let gitExtensionReposContainingFile = gitApi.repositories
        .filter((repo) => FilePathUtils.isDescendant(repo.rootUri.fsPath, uri.fsPath));

      // If repos in total containing file outnumbers discovered repos containing file, return undefined
      if (gitExtensionReposContainingFile.length > discoveredReposContainingFile.length) {
        return undefined;
      }
    }

    if (discoveredReposContainingFile.length === 1) {
      return discoveredReposContainingFile[0][1];
    } else if (discoveredReposContainingFile.length > 0) {
      return discoveredReposContainingFile.sort(([pathA, repoA], [pathB, repoB]) => pathB.length - pathA.length)[0][1];
    }
  }

  public static async getCurrentMagitRepo(uri?: Uri): Promise<MagitRepository | undefined> {

    let magitRepository = this.getCurrentMagitRepoNO_STATUS(uri);

    // TODO: Should maybe call 'internalMagitStatus' here to guarantee updated MagitRepository, but it slows down everything :p
    // if (magitRepository) {
    //   magitRepository = await Status.internalMagitStatus(magitRepository.gitRepository);
    //   magitRepositories.set(magitRepository.uri.fsPath, magitRepository);
    // }
    if (!magitRepository) {
      let repository = await this.discoverRepo(uri);
      if (repository) {
        magitRepository = await Status.internalMagitStatus(repository);
        magitRepositories.set(magitRepository.uri.fsPath, magitRepository);
      }
    }

    return magitRepository;
  }

  public static getCurrentMagitRepoNO_STATUS(uri?: Uri): MagitRepository | undefined {
    let magitRepository: MagitRepository | undefined;

    if (uri) {
      magitRepository = magitRepositories.get(uri.query);
      if (!magitRepository) {
        magitRepository = this.getMagitRepoThatContainsFile(uri);
      }
    }

    return magitRepository;
  }

  private static discoverRepoThatContainsFile(uri: Uri): Repository | undefined {
    let reposContainingFile = gitApi.repositories.filter(r => FilePathUtils.isDescendant(r.rootUri.fsPath, uri.fsPath));

    if (reposContainingFile.length === 1) {
      return reposContainingFile[0];
    }

    if (reposContainingFile.length > 0) {
      return reposContainingFile.sort((repoA, repoB) => repoB.rootUri.fsPath.length - repoA.rootUri.fsPath.length)[0];
    }
  }

  public static async discoverRepo(uri?: Uri): Promise<Repository | undefined> {

    let repository;

    if (gitApi.repositories.length === 1) {
      repository = gitApi.repositories[0];
    }
    else if (gitApi.repositories.length) {

      if (uri) {
        repository = this.discoverRepoThatContainsFile(uri);
      }

      if (!repository && vscode.workspace.workspaceFolders?.length === 1) {
        repository = this.discoverRepoThatContainsFile(vscode.workspace.workspaceFolders[0].uri);
      }

      if (!repository) {
        type RepoPickResult = { repository?: Repository, initRepo?: Boolean };

        const repoPicker: PickMenuItem<RepoPickResult | undefined>[] = gitApi.repositories.map(repo => ({ label: repo.rootUri.fsPath, meta: { repository: repo } }));

        repoPicker.push({ label: 'Init repo', meta: { initRepo: true } });
        let result = await PickMenuUtil.showMenu(repoPicker, 'Which repository?');

        if (result?.initRepo) {
          commands.executeCommand('git.init');
          return undefined;
        } else if (result?.repository) {
          repository = result.repository;
        } else {
          return undefined;
        }
      }
    }

    if (!repository) {
      await commands.executeCommand('git.init');
    }

    return repository;
  }

  public static getCurrentMagitRepoAndView(uri: Uri): [MagitRepository | undefined, DocumentView | undefined] {
    const repository = magitRepositories.get(uri.query);
    const currentView = views.get(uri.toString());
    return [repository, currentView];
  }

  public static async magitStatusAndUpdate(repository: MagitRepository) {
    // Smart Status Update Implementation:
    // This system carefully manages when to update the magit status display
    // to ensure accuracy while preventing update loops or conflicts.
    // The implementation:
    // 1. Checks for active git operations that might be disrupted
    // 2. Verifies repository state validity
    // 3. Handles special cases like merges and index changes safely
    // 4. Manages concurrent access to git files
    // 
    // Key features:
    // - Skips updates during rebase operations
    // - Safely handles merge states by checking for lock files
    // - Protects git config access during updates
    // - Gracefully handles errors without disrupting git state
    // 
    // This ensures the status display stays accurate while avoiding
    // interference with ongoing git operations.

    // Don't update if we're in the middle of a git operation
    const state = repository.gitRepository.state;
    
    // Skip update if there's no meaningful state
    if (!state || !state.HEAD || state.HEAD.commit === undefined) {
      return;
    }

    // Skip update during potentially conflicting operations
    if (state.rebaseCommit) {
      return;
    }

    // Allow updates during merge/index changes, but only if there are no lock files
    if (state.mergeChanges?.length > 0 || state.indexChanges.length > 0) {
      try {
        const lockFiles = await workspace.findFiles(
          new RelativePattern(repository.gitRepository.rootUri.fsPath, '.git/*.lock')
        );
        if (lockFiles.length > 0) {
          return;
        }
      } catch (error) {
        // If we can't check lock files, better to skip the update
        return;
      }
    }

    // Don't update if git config is being accessed
    try {
      const configLockFile = Uri.joinPath(repository.gitRepository.rootUri, '.git', 'config.lock');
      const configLockExists = await workspace.fs.stat(configLockFile).then(() => true, () => false);
      if (configLockExists) {
        return;
      }
    } catch (error) {
      // Ignore error and proceed with update
    }

    let updatedRepository = await Status.internalMagitStatus(repository.gitRepository);
    magitRepositories.set(updatedRepository.uri.fsPath, updatedRepository);
    views.forEach(view => view.needsUpdate && view.uri.query === updatedRepository.uri.fsPath ? view.update(updatedRepository) : undefined);
  }

  public static magitAnythingModified(repository: MagitRepository): boolean {
    return (repository.indexChanges.length > 0 ||
      repository.workingTreeChanges.length > 0 ||
      (repository.mergeChanges?.length ?? 0) > 0);
  }

  public static async chooseRef(repository: MagitRepository, prompt: string, showCurrent = false, showHEAD = false, allowFreeform = true, remoteOnly = false): Promise<string> {

    const getCursorCommitHash: () => Promise<PickMenuItem<string> | undefined> = async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor === undefined) {
        return undefined;
      }
      const document = activeEditor.document;
      const selection = activeEditor.selection;
      const hashWordRange = document.getWordRangeAtPosition(selection.active, /[0-9a-z]{7}/);
      if (hashWordRange === undefined) {
        return undefined;
      }
      const hash = document.getText(hashWordRange);

      try {
        await getCommit(repository.gitRepository, hash);        
      } catch (error) {
        return undefined;
      }

      return { label: hash, meta: hash };
    };

    const refs: PickMenuItem<string>[] = [];

    const cursorCommitHash = await getCursorCommitHash();

    if (cursorCommitHash) {
      refs.push(cursorCommitHash);
    }

    if (showCurrent && repository.HEAD?.name) {
      refs.push({
        label: repository.HEAD.name,
        description: GitTextUtils.shortHash(repository.HEAD.commit),
        meta: repository.HEAD.name
      });
    }

    if (showHEAD) {
      refs.push({
        label: 'HEAD',
        description: GitTextUtils.shortHash(repository.HEAD?.commit),
        meta: 'HEAD'
      });
    }

    refs.push(...repository.refs
      .filter(ref => ref.name !== repository.HEAD?.name && (!remoteOnly || ref.type === RefType.RemoteHead))
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

    const commitPicker = repository.log.map(commit => ({
      label: GitTextUtils.shortHash(commit.hash),
      description: commit.message,
      meta: commit.hash
    })) ?? [];

    return PickMenuUtil.showMenuWithFreeform(commitPicker, prompt);
  }

  public static async chooseTag(repository: MagitRepository, prompt: string) {
    const refs = repository.refs
      .filter(ref => ref.type === RefType.Tag)
      .map(r => r.name!);

    return window.showQuickPick(refs, { placeHolder: prompt });
  }

  public static async confirmAction(prompt: string) {

    let renderedPrompt = `${prompt} (y or n)`;

    return new Promise(resolve => {

      let resolveOnHide = true;

      const _inputBox = window.createInputBox();
      _inputBox.validationMessage = renderedPrompt;

      let changeListener = _inputBox.onDidChangeValue(e => {
        if (e.toLowerCase().includes('y')) {
          resolveOnHide = false;
          _inputBox.hide();
          resolve(true);
        } else if (e.toLowerCase().includes('n') || e.toLowerCase().includes('q')) {
          _inputBox.hide();
        }
      });

      let onHideListener = _inputBox.onDidHide(() => {
        _inputBox.dispose();
        changeListener.dispose();
        onHideListener.dispose();
        if (resolveOnHide) {
          window.setStatusBarMessage('Abort', Constants.StatusMessageDisplayTimeout);
          resolve(false);
        }
      });

      _inputBox.show();
    });
  }

  public static async selectAction(prompt: string, options: Selection[]): Promise<string | undefined> {

    const optionsStr = options.reduce((acc, current) => {
      const { description } = current;
      if (acc !== '') {
        return acc.concat(', ', description);
      } else {
        return acc.concat(description);
      }
    }, '');
    let renderedPrompt = `${prompt}: Select one of ${optionsStr} or [q] to abort`;

    return new Promise(resolve => {

      let resolveOnHide = true;
      let selection = options[0].key;

      const _inputBox = window.createInputBox();
      _inputBox.validationMessage = renderedPrompt;

      let changeListener = _inputBox.onDidChangeValue(e => {
        const input = e.toLocaleLowerCase();
        let found = options.find((selection) => selection.key === input);
        if (found) {
          resolveOnHide = false;
          _inputBox.hide();
          resolve(found.key);
        } else if (e.toLowerCase().includes('q')) {
          _inputBox.hide();
        }
      });

      let onHideListener = _inputBox.onDidHide(() => {
        _inputBox.dispose();
        changeListener.dispose();
        onHideListener.dispose();
        if (resolveOnHide) {
          window.setStatusBarMessage('Abort', Constants.StatusMessageDisplayTimeout);
          resolve(undefined);
        }
      });

      _inputBox.show();
    });
  }
}

