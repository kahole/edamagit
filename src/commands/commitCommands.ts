import { exec, spawn, ExecException } from "child_process";
import { window, workspace, ViewColumn, TextEditor, commands, Uri } from "vscode";
import * as Constants from "../common/constants";
import { execPath } from "process";
import { MagitRepository } from "../models/magitRepository";
import MagitStagedView from "../views/stagedView";
import { DocumentView } from "../views/general/documentView";

export async function magitCommit(repository: MagitRepository, currentView: DocumentView) {

  // TODO: show menu etc..
  // inline menu here, only to set args: --amend, etc
  // a - AMEND: commit --amend
  // e - EXTEND: commit --amend --no-edit
  // w - REWORD (git commit --amend --only)
  // f - Fixup git commit --fixup  into commit from list
  // s - Squash - Squash into commit from list of commits
  // A - Augment - same as squash but with you can edit the squash message
  // F - Instant fixup
  // S - Instant squash

  if (repository) {

    let args = ["commit"];

    let stagedEditor: Thenable<TextEditor> | undefined;
    try {

      window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

      const uri = MagitStagedView.encodeLocation(repository.rootUri.path);

      stagedEditor = workspace.openTextDocument(uri)
        .then(doc => window.showTextDocument(doc, ViewColumn.One, true));

      // TODO: Make Cross-platform
      let codePath = execPath.split(/(?<=\.app)/)[0] + "/Contents/Resources/app/bin/code";

      console.log(codePath);

      const env = { "GIT_EDITOR": `"${codePath}" --wait` };
      // const env = { "GIT_EDITOR": "code --wait" };

      const commitSuccessMessage = await repository._repository.repository.run(args, { env });

      window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);

    } catch (e) {
      window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
    } finally {

      // Sadly, the only way to close an editor nor currently in focus:
      stagedEditor?.then(editor => {
        // if (editor.document.) {
        window.showTextDocument(editor.document, ViewColumn.One)
          .then(() => commands.executeCommand('workbench.action.closeActiveEditor'));
        // }
      }
      );
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