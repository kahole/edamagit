import { window, ViewColumn, TextEditor, commands } from 'vscode';
import * as vscode from 'vscode';
import * as Constants from '../common/constants';
import { execPath } from 'process';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import { MenuUtil, MenuState } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';
import { showDiffSection } from './diffingCommands';
import { Section } from '../views/general/sectionHeader';
import * as path from 'path';
import FilePathUtils from '../utils/filePathUtils';

const commitMenu = {
  title: 'Committing',
  commands: [
    { label: 'c', description: 'Commit', action: commit },
    { label: 'a', description: 'Amend', action: (menuState: MenuState) => commit(menuState, ['--amend']) },
    { label: 'e', description: 'Extend', action: (menuState: MenuState) => commit(menuState, ['--amend', '--no-edit']) },
    { label: 'w', description: 'Reword', action: (menuState: MenuState) => commit(menuState, ['--amend', '--only']) },
    { label: 'f', description: 'Fixup', action: (menuState: MenuState) => fixup(menuState) },
  ]
};

export async function magitCommit(repository: MagitRepository) {

  const switches = [
    { shortName: '-a', longName: '--all', description: 'Stage all modified and deleted files' },
    { shortName: '-e', longName: '--allow-empty', description: 'Allow empty commit' }
  ];

  return MenuUtil.showMenu(commitMenu, { repository, switches });
}

export async function commit({ repository, switches }: MenuState, commitArgs: string[] = []) {

  const args = ['commit', ...MenuUtil.switchesToArgs(switches), ...commitArgs];

  return runCommitLikeCommand(repository, args);
}

export async function fixup({ repository, switches }: MenuState) {
  const sha = await MagitUtils.chooseCommit(repository, 'Fixup commit');

  if (sha) {
    const args = ['commit', ...MenuUtil.switchesToArgs(switches), '--fixup', sha];

    return await gitRun(repository, args);
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

export async function runCommitLikeCommand(repository: MagitRepository, args: string[], { showStagedChanges, updatePostCommitTask, editor, propagateErrors }: CommitEditorOptions = { showStagedChanges: true }) {

  let stagedEditorTask: Thenable<TextEditor> | undefined;
  let instructionStatus;
  let editorListener;
  try {

    instructionStatus = window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

    if (showStagedChanges) {
      stagedEditorTask = showDiffSection(repository, Section.Staged, true);
    }

    // Check if we are currently running a Code Insiders or Codium build
    let isInsiders = vscode.env.appName.includes('Insider');
    let isCodium = vscode.env.appName.includes('Codium');
    let isDarwin = process.platform === 'darwin';

    let codePath = 'code';
    if (isCodium && !isDarwin) {
      codePath = 'codium';
    }
    if (isInsiders) {
      codePath += '-insiders';
    }

    // Find the code binary on different platforms.
    if (isDarwin) {
      codePath = execPath.split(/(?<=\.app)/)[0] + '/Contents/Resources/app/bin/' + codePath;
    } else {
      codePath = path.join(path.dirname(execPath), 'bin', codePath);
    }

    const env = { [editor ?? 'GIT_EDITOR']: `"${codePath}" --wait` };

    const commitSuccessMessageTask = gitRun(repository, args, { env });
    editorListener = vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && FilePathUtils.fileName(editor.document.uri) === 'COMMIT_EDITMSG') {
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

    editorListener.dispose();
    instructionStatus.dispose();
    window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);

  } catch (e) {
    if (editorListener) {
      editorListener.dispose();
    }
    if (instructionStatus) {
      instructionStatus.dispose();
    }
    window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
    if (propagateErrors) {
      throw e;
    }
  } finally {

    const stagedEditor = await stagedEditorTask;
    if (stagedEditor) {
      for (const visibleEditor of window.visibleTextEditors) {
        if (visibleEditor.document.uri === stagedEditor.document.uri) {
          // This is a bit of a hack. Too bad about editor.hide() and editor.show() being deprecated.
          const stagedEditorViewColumn = MagitUtils.oppositeActiveViewColumn();
          await window.showTextDocument(stagedEditor.document, { viewColumn: stagedEditorViewColumn, preview: false });
          await commands.executeCommand('workbench.action.closeActiveEditor');
          commands.executeCommand(`workbench.action.navigate${stagedEditorViewColumn === ViewColumn.One ? 'Right' : 'Left'}`);
        }
      }
    }
  }
}