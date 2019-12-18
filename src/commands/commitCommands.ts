import { gitApi } from "../extension";
import { exec, spawn, ExecException } from "child_process";
import { window } from "vscode";
import MagitUtils from "../utils/magitUtils";
import * as Constants from "../common/constants";
import { execPath } from "process";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";

export async function magitCommit(repository: MagitRepository, currentView: MagitStatusView) {

  // TODO: show menu etc..
  if (repository) {

    // TODO: code is not always in PATH!
    //   get and use full path to vscode executable
    //  ofc, there is the vscode command: Shell command: Install 'code' command in PATH
    let vscodeExecutablePath = execPath; // Different in debug / developing extension mode than normal vscode mode??
    console.log(vscodeExecutablePath);

    // let gitExecutablePath = gitApi.git.path;
    // let cwd = repository.rootUri.fsPath;

    let userEditor: string | undefined;
    try {
      
      userEditor = await repository.getConfig("core.editor");

      await repository.setConfig("core.editor", "code --wait");

      // TODO:
      // - Open staged changes document to the left!

      window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

      // TODO:
      // Which one:

      // let commitSuccessMessage = await execPromise(`${gitExecutablePath} commit`, cwd);

      // TODO: this needs to be wrapped, and it needs to decide between run and exec!
      let args = ["commit"];
      let commitSuccessMessage = await repository._repository.repository.run(args);

      window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.stdout.replace(Constants.LineSplitterRegex, ' ')}`, Constants.StatusMessageDisplayTimeout);
      
    } catch (e) {
      //YES: Aborting due to empty commit message will appear here
      window.setStatusBarMessage(`Commit canceled.`, Constants.StatusMessageDisplayTimeout);
    } finally {
      if (userEditor) {
        repository.setConfig("core.editor", userEditor);
      }
    }
  }
}

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