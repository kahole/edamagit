import { window, workspace, ViewColumn, TextEditor, commands } from 'vscode';
import * as Constants from '../common/constants';
import { execPath } from 'process';
import { MagitRepository } from '../models/magitRepository';
import StagedView from '../views/stagedView';
import { gitRun } from '../utils/gitRawRunner';
import { views } from '../extension';
import { MenuUtil, MenuState } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';

export async function magitCommit(repository: MagitRepository) {

  const commitMenu = {
    title: 'Committing',
    commands: [
      { label: 'c', description: 'Commit', action: (menuState: MenuState) => commit(menuState.repository, MenuUtil.switchesToArgs(menuState.switches)) },
      { label: 'a', description: 'Amend', action: (menuState: MenuState) => commit(menuState.repository, ['--amend', ...MenuUtil.switchesToArgs(menuState.switches)]) },
      { label: 'e', description: 'Extend', action: (menuState: MenuState) => commit(menuState.repository, ['--amend', '--no-edit', ...MenuUtil.switchesToArgs(menuState.switches)]) },
      { label: 'w', description: 'Reword', action: (menuState: MenuState) => commit(menuState.repository, ['--amend', '--only', ...MenuUtil.switchesToArgs(menuState.switches)]) },
      // { label: "f", description: "Fixup", action: (menuState: MenuState) => commit(menuState.repository, ['--fixup']) },
    ]
  };

  const switches = [
    { shortName: '-a', longName: '--all', description: 'Stage all modified and deleted files' },
    { shortName: '-e', longName: '--allow-empty', description: 'Allow empty commit' }
  ];

  return MenuUtil.showMenu(commitMenu, { repository, switches });
}

export async function commit(repository: MagitRepository, commitArgs: string[] = []) {

  const args = ['commit', ...commitArgs];

  return runCommitLikeCommand(repository, args);
}

export async function runCommitLikeCommand(repository: MagitRepository, args: string[]) {

  let stagedEditor: Thenable<TextEditor> | undefined;
  let instructionStatus;
  try {

    instructionStatus = window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

    const uri = StagedView.encodeLocation(repository);
    views.set(uri.toString(), new StagedView(uri, repository.magitState!));
    stagedEditor = workspace.openTextDocument(uri)
      .then(doc => window.showTextDocument(doc, MagitUtils.oppositeActiveViewColumn(), true));

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
          // This is a bit of a hack. Too bad about editor.hide() and editor.show()
          const stagedEditorViewColumn = MagitUtils.oppositeActiveViewColumn();
          await window.showTextDocument(editor.document, stagedEditorViewColumn);
          await commands.executeCommand('workbench.action.closeActiveEditor');
          return commands.executeCommand(`workbench.action.navigate${stagedEditorViewColumn === ViewColumn.One ? 'Right' : 'Left'}`);
        }
      }
    }
  }
}