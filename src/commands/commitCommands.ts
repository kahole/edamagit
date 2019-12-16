import { gitApi } from "../extension";
import { exec, spawn, ExecException } from "child_process";
import { window } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { LineSplitterRegex } from "../common/constants";
import { execPath } from "process";

export async function magitCommit() {

  let currentRepository = MagitUtils.getCurrentMagitRepo();

  // TODO: show menu etc..
  
  if (currentRepository) {

    // TODO: code is not always in PATH!
    //   get and use full path to vscode executable
    //  ofc, there is the vscode command: Shell command: Install 'code' command in PATH
    let vscodeExecutablePath = execPath; // Different in debug / developing extension mode than normal vscode mode??
    console.log(vscodeExecutablePath);

    let gitExecutablePath = gitApi.git.path;

    let cwd = currentRepository.rootUri.fsPath;

    let userEditor: string | undefined;
    try {
      
      userEditor = await currentRepository.getConfig("core.editor");

      await currentRepository.setConfig("core.editor", "code --wait");

      // TODO:
      // - Open staged changes document to the left!

      window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

      // TODO:
      // Is spawn faster? doesnt spawn a shell
      // spawn(gitExecutablePath, ["commit"], { cwd: currentRepository.rootUri.fsPath });

      let commitSuccessMessage = await execPromise(`${gitExecutablePath} commit`, cwd);

      window.setStatusBarMessage(`Git finished: ${commitSuccessMessage.replace(LineSplitterRegex, ' ')}`);
      
    } catch (e) {
      //YES: Aborting due to empty commit message will appear here
      window.setStatusBarMessage(`Commit canceled.`);
      console.log(e);
    } finally {
      if (userEditor) {
        currentRepository.setConfig("core.editor", userEditor);
      }
    }
  }
}

function execPromise(command: string, cwd: string): Promise<string> {
  return new Promise( (resolve, reject) => {

    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      }
      else {
        resolve(stdout);
      }
    });
  });
}

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