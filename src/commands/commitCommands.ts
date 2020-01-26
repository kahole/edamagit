import { exec, spawn, ExecException } from 'child_process';
import { window, workspace, ViewColumn, TextEditor, commands, Uri } from 'vscode';
import * as Constants from '../common/constants';
import { execPath } from 'process';
import { MagitRepository } from '../models/magitRepository';
import MagitStagedView from '../views/stagedView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { views } from '../extension';
import { MenuUtil, MenuState } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';


const commitMenu = {
  title: 'Committing',
  commands: [
    { label: 'c', description: 'Commit', action: (menuState: MenuState) => commit(menuState.repository, []) },
    { label: 'a', description: 'Amend', action: (menuState: MenuState) => commit(menuState.repository, ['--amend']) },
    { label: 'e', description: 'Extend', action: (menuState: MenuState) => commit(menuState.repository, ['--amend', '--no-edit']) },
    { label: 'w', description: 'Reword', action: (menuState: MenuState) => commit(menuState.repository, ['--amend', '--only']) },
    // { label: "f", description: "Fixup", action: (menuState: MenuState) => commit(menuState.repository, ['--fixup']) },
  ]
};

// inline menu here, only to set args: --amend, etc
// a - AMEND: commit --amend
// e - EXTEND: commit --amend --no-edit
// w - REWORD (git commit --amend --only)
// f - Fixup git commit --fixup  into commit from list
// s - Squash - Squash into commit from list of commits
// A - Augment - same as squash but with you can edit the squash message
// F - Instant fixup
// S - Instant squash

export async function magitCommit(repository: MagitRepository, currentView: DocumentView) {
  return MenuUtil.showMenu(commitMenu, { repository, currentView });
}

export async function commit(repository: MagitRepository, commitArgs: string[] = []) {

  const args = ['commit', ...commitArgs];

  let stagedEditor: Thenable<TextEditor> | undefined;
  try {

    window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

    const uri = MagitStagedView.encodeLocation(repository.rootUri.path);
    views.set(uri.toString(), new MagitStagedView(uri, repository.magitState!));
    stagedEditor = workspace.openTextDocument(uri)
      .then(doc => window.showTextDocument(doc, MagitUtils.oppositeActiveViewColumn(), true));

    // code is in path on Linux and Windows
    // can use just "code" if it is in path. Vscode command: "Shell Command: Install code in path"
    let codePath = 'code';

    // Only for mac
    if (process.platform === 'darwin') {
      codePath = execPath.split(/(?<=\.app)/)[0] + '/Contents/Resources/app/bin/code';
    }

    const env = { 'GIT_EDITOR': `"${codePath}" --wait` };

    const commitSuccessMessage = await gitRun(repository, args, { env });

    window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);

  } catch (e) {
    window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
  } finally {
    // MINOR: seriously hacky. Too bad about editor.hide() and editor.show()
    const editor = await stagedEditor;
    if (editor) {
      const stagedEditorViewColumn = MagitUtils.oppositeActiveViewColumn();
      await window.showTextDocument(editor.document, stagedEditorViewColumn);
      await commands.executeCommand('workbench.action.closeActiveEditor');
      return commands.executeCommand(`workbench.action.navigate${stagedEditorViewColumn === ViewColumn.One ? 'Right' : 'Left'}`);
    }
  }
}

// let gitExecutablePath = gitApi.git.path;
// let cwd = repository.rootUri.fsPath;

// function execPromise(command: string, cwd: string): Promise<string> {
//   return new Promise( (resolve, reject) => {

//     exec(command, { cwd }, (error, stdout, stderr) => {
//       if (error) {
//         reject(stderr);
//       }
//       else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// function spawnPromise(command: string, args: string[], cwd: string): Promise<string> {
//   return new Promise( async (resolve, reject) => {

//     let process = spawn(command, args, { cwd });

//     for await (const data of process.stdout) {
//       console.log(`stdout from the child: ${data}`);
//     }


//     exec(command, { cwd }, (error, stdout, stderr) => {
//       if (error) {
//         reject(stderr);
//       }
//       else {
//         resolve(stdout);
//       }
//     });
//   });
// }