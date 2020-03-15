import { window, workspace, ViewColumn, TextEditor, commands } from 'vscode';
import * as Constants from '../common/constants';
import { execPath } from 'process';
import { MagitRepository } from '../models/magitRepository';
import SectionDiffView from '../views/sectionDiffView';
import { gitRun } from '../utils/gitRawRunner';
import { views } from '../extension';
import { MenuUtil, MenuState } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';
import { showDiffSection } from './diffingCommands';
import { Section } from '../views/general/sectionHeader';

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

export async function runCommitLikeCommand(repository: MagitRepository, args: string[]) {

  let stagedEditor: Thenable<TextEditor> | undefined;
  let instructionStatus;
  try {

    instructionStatus = window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

    stagedEditor = showDiffSection(repository, Section.Staged, true);

    let codePath = 'code';

    // Only for mac
    // can only use "code" if it is in path. Vscode command: "Shell Command: Install code in path"
    if (process.platform === 'darwin') {
      codePath = execPath.split(/(?<=\.app)/)[0] + '/Contents/Resources/app/bin/code';
    }

    const env = { 'GIT_EDITOR': `"${codePath}" --wait` };

    const commitSuccessMessage = await gitRun(repository, args, { env });

    instructionStatus.dispose();
    window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);

  } catch (e) {
    if (instructionStatus) {
      instructionStatus.dispose();
    }
    window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
  } finally {

    const editor = await stagedEditor;
    if (editor) {
      for (const visibleEditor of window.visibleTextEditors) {
        if (visibleEditor.document.uri === editor.document.uri) {
          // This is a bit of a hack. Too bad about editor.hide() and editor.show() being deprecated.
          const stagedEditorViewColumn = MagitUtils.oppositeActiveViewColumn();
          await window.showTextDocument(editor.document, { viewColumn: stagedEditorViewColumn, preview: false });
          await commands.executeCommand('workbench.action.closeActiveEditor');
          commands.executeCommand(`workbench.action.navigate${stagedEditorViewColumn === ViewColumn.One ? 'Right' : 'Left'}`);
        }
      }
    }
  }
}