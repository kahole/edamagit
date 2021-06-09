import * as vscode from 'vscode';
import * as Constants from '../common/constants';
import { execPath } from 'process';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import { MenuUtil, MenuState } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';
import * as Diffing from './diffingCommands';
import { Section } from '../views/general/sectionHeader';
import * as path from 'path';
import FilePathUtils from '../utils/filePathUtils';
import * as fs from 'fs';
import ViewUtils from '../utils/viewUtils';
import GitTextUtils from '../utils/gitTextUtils';
import { magitConfig } from '../extension';

const commitMenu = {
  title: 'Committing',
  commands: [
    { label: 'c', description: 'Commit', action: commit },
    { label: 'a', description: 'Amend', action: (menuState: MenuState) => ammendCommit(menuState, ['--amend']) },
    { label: 'e', description: 'Extend', action: (menuState: MenuState) => ammendCommit(menuState, ['--amend', '--no-edit']) },
    { label: 'w', description: 'Reword', action: (menuState: MenuState) => rewordCommit(menuState, ['--amend', '--only']) },
    { label: 'f', description: 'Fixup', action: (menuState: MenuState) => fixup(menuState) },
    { label: 'F', description: 'Instant Fixup', action: (menuState: MenuState) => instantFixup(menuState) },
  ]
};

export async function magitCommit(repository: MagitRepository) {

  const switches = [
    { key: '-a', name: '--all', description: 'Stage all modified and deleted files' },
    { key: '-e', name: '--allow-empty', description: 'Allow empty commit' },
    { key: '-s', name: '--signoff', description: 'Add Signed-off-by line' },
  ];

  return MenuUtil.showMenu(commitMenu, { repository, switches });
}

export async function commit({ repository, switches }: MenuState, commitArgs: string[] = []) {

  let stageAllSwitch = switches?.find(({ key }) => key === '-a');

  if (repository.indexChanges.length === 0 && !stageAllSwitch?.activated && stageAllSwitch) {
    if (await MagitUtils.confirmAction('Nothing staged. Stage and commit all unstaged changes?')) {
      stageAllSwitch.activated = true;
    } else {
      return;
    }
  }

  const args = ['commit', ...MenuUtil.switchesToArgs(switches), ...commitArgs];

  return runCommitLikeCommand(repository, args, { showStagedChanges: !stageAllSwitch?.activated });
}

export async function ammendCommit({ repository, switches }: MenuState, commitArgs: string[] = []) {
  const args = ['commit', ...MenuUtil.switchesToArgs(switches), ...commitArgs];
  return runCommitLikeCommand(repository, args);
}

export async function rewordCommit({ repository, switches }: MenuState, commitArgs: string[] = []) {
  const args = ['commit', ...MenuUtil.switchesToArgs(switches), ...commitArgs];
  return runCommitLikeCommand(repository, args, { showStagedChanges: false });
}

async function fixup({ repository, switches }: MenuState) {
  const sha = await MagitUtils.chooseCommit(repository, 'Fixup commit');

  if (sha) {
    const args = ['commit', ...MenuUtil.switchesToArgs(switches), '--fixup', sha];

    return await gitRun(repository.gitRepository, args);
  } else {
    throw new Error('No commit chosen to fixup');
  }
}

async function instantFixup({ repository, switches = [] }: MenuState) {
  const sha = await MagitUtils.chooseCommit(repository, 'Instantly Fixup commit');

  if (sha) {
    let shortHash = GitTextUtils.shortHash(sha);

    await gitRun(repository.gitRepository, ['commit', '--no-gpg-sign', '--no-edit', `--fixup=${shortHash}`, '--']);

    const args = ['rebase', '-i', '--autosquash', '--autostash', shortHash + '~'];

    return await gitRun(repository.gitRepository, args, { env: { 'GIT_SEQUENCE_EDITOR': 'true' } });
  } else {
    throw new Error('No commit chosen to fixup');
  }
}

interface CommitEditorOptions {
  updatePostCommitTask?: boolean;
  showStagedChanges?: boolean;
  editor?: string;
  propagateErrors?: boolean;
}

const codePath: string = findCodePath();

export async function runCommitLikeCommand(repository: MagitRepository, args: string[], { showStagedChanges, updatePostCommitTask, editor, propagateErrors }: CommitEditorOptions = { showStagedChanges: true }) {

  let stagedEditorTask: Thenable<vscode.TextEditor> | undefined;
  let instructionStatus;
  let editorListener;
  try {

    instructionStatus = vscode.window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

    if (showStagedChanges) {
      stagedEditorTask = Diffing.showDiffSection(repository, Section.Staged, true);
    }

    const env: NodeJS.ProcessEnv = { 'GIT_EDITOR': `"${codePath}" --wait` };

    if (editor) {
      env[editor] = `"${codePath}" --wait`;
    }

    const commitSuccessMessageTask = gitRun(repository.gitRepository, args, { env });

    editorListener = vscode.window.onDidChangeActiveTextEditor(editor => {
      if (
        editor &&
        FilePathUtils.fileName(editor.document.uri) === 'COMMIT_EDITMSG' &&
        editor.document.getText(new vscode.Range(0, 0, 0, 1)) === ''
      ) {
        // Move the cursor to the beginning
        const position = editor.selection.active;
        const newPosition = position.with(0, 0);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
      }
    });

    if (updatePostCommitTask) {
      await new Promise(r => setTimeout(r, 100));
      MagitUtils.magitStatusAndUpdate(repository);
    }

    const commitSuccessMessage = await commitSuccessMessageTask;

    vscode.window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);

  } catch (e) {
    vscode.window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
    if (propagateErrors) {
      throw e;
    }
  } finally {
    if (editorListener) {
      editorListener.dispose();
    }
    if (instructionStatus) {
      instructionStatus.dispose();
    }

    const stagedEditor = await stagedEditorTask;
    if (stagedEditor) {
      for (const visibleEditor of vscode.window.visibleTextEditors) {
        if (visibleEditor.document.uri === stagedEditor.document.uri) {
          // This is a bit of a hack. Too bad about editor.hide() and editor.show() being deprecated.
          const stagedEditorViewColumn = ViewUtils.showDocumentColumn();
          await vscode.window.showTextDocument(stagedEditor.document, { viewColumn: stagedEditorViewColumn, preview: false });
          await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
          vscode.commands.executeCommand(`workbench.action.navigate${stagedEditorViewColumn === vscode.ViewColumn.One ? 'Right' : 'Left'}`);
        }
      }
    }
  }
}

function findCodePath(): string {
  // Check if we are currently running a Code Insiders or Codium build
  let isInsiders = vscode.env.appName.includes('Insider');
  let isCodium = vscode.env.appRoot.includes('codium');
  let isDarwin = process.platform === 'darwin';
  let isWindows = process.platform === 'win32';
  let isRemote = !!vscode.env.remoteName;

  if (magitConfig.codePath !== "") {
    return magitConfig.codePath
  }
  let codePath = 'code';
  if (isCodium && !isDarwin) {
    codePath = 'codium';
  }
  if (isInsiders && !isDarwin) {
    // On Mac the binary for the Insiders build is still called `code`
    codePath += '-insiders';
  }
  if (isWindows && isRemote) {
    // On window remote server, 'code' alias doesn't exist
    codePath += '.cmd';
  }

  // Find the code binary on different platforms.
  if (isDarwin) {
    codePath = execPath.split(/(?<=\.app)/)[0] + '/Contents/Resources/app/bin/' + codePath;
  } else {
    codePath = path.join(path.dirname(execPath), 'bin', codePath);
  }

  if (!fs.existsSync(codePath)) {
    return 'code';
  }

  return codePath;
}
