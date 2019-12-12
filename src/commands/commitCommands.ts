import { gitApi } from "../extension";
import { exec, spawn, ExecException } from "child_process";
import { window } from "vscode";
import MagitUtils from "../utils/magitUtils";

export async function magitCommit() {

  let currentRepository = MagitUtils.getCurrentMagitRepo();

  // TODO: show menu etc..

  if (currentRepository) {

    // TODO: code is not always in PATH!
    //   get and use full path to vscode executable?
    //  ofc, there is the vscode command: Shell command: Install 'code' command in PATH

    let cwd = currentRepository.rootUri.fsPath;

    let userEditor: string | undefined;
    try {
      userEditor = (await execPromise("git config core.editor", cwd)).trim();

      await execPromise("git config core.editor \"code --wait\"", cwd);

      // TODO:
      // - Open staged changes document to the left!

      window.setStatusBarMessage(`Type C-c C-c to finish, or C-c C-k to cancel`);

      let commitSuccessMessage = await execPromise("git commit", cwd);

      window.setStatusBarMessage(`Git finished: ${commitSuccessMessage}`);
      
    } catch (e) {
      //YES: Aborting due to empty commit message will appear here
      window.setStatusBarMessage(`Commit canceled.`);
      console.log(e);
    } finally {
      if (userEditor) {
        execPromise(`git config core.editor "${userEditor}"`, cwd);
      }
    }

    // TODO:
    // Is spawn more reliable? given the gitExecutablePath etc?
    let gitExecutablePath = gitApi.git.path;

    // let a = spawn(gitExecutablePath, ["config", "core.editor"], { cwd: currentRepository.rootUri.fsPath });
    // spawn(gitExecutablePath, ["config", "core.editor", "\"code --wait\""], { cwd: currentRepository.rootUri.fsPath });
    // need to wait until each finished

    // spawn(gitExecutablePath, ["commit"], { cwd: currentRepository.rootUri.fsPath });
    // spawn(gitExecutablePath, ["config", "core.editor", `"${userEditor}"`], { cwd: currentRepository.rootUri.fsPath });
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