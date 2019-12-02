// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace, languages, window, extensions, commands, ExtensionContext, Disposable, ViewColumn, FileChangeType } from 'vscode';
import ContentProvider, { encodeLocation } from './provider';
import { API as GitAPI, GitExtension, APIState, Status } from './typings/git';



// https://github.com/microsoft/vscode/blob/f667462a2a8a12c92dbcdd8acf92df7354063691/extensions/git/src/util.ts#L309
import { dirname, sep } from 'path';
function isWindowsPath(path: string): boolean {
  return /^[a-zA-Z]:\\/.test(path);
}

function isDescendant(parent: string, descendant: string): boolean {
  if (parent === descendant) {
    return true;
  }

  if (parent.charAt(parent.length - 1) !== sep) {
    parent += sep;
  }

  // Windows is case insensitive
  if (isWindowsPath(parent)) {
    parent = parent.toLowerCase();
    descendant = descendant.toLowerCase();
  }

  return descendant.startsWith(parent);
}
//------------------------------------

export function activate(context: ExtensionContext) {


  // How to

  // Use existing tooling as much as possible
  //    make magit, but the fancy stuff should be vscode like

  // BIGGEST CHALLENGE RN
  // Git: either use vscode.git or run commands and "parse"
  //   Nice example:
  //    https://github.com/DonJayamanne/gitHistoryVSCode/blob/master/src/adapter/exec/gitCommandExec.ts

  // Git extension API
  //     https://github.com/microsoft/vscode/blob/master/extensions/git/src/api/api1.ts
  //  Svakt, men exposer git executable

  // Language:
  // Custom keybindings for buffer: define a language mode
  //   language is activated based on file ending in uri, so .magit from provider.ts

  // Transient interface:
  // Key presses: https://github.com/lucax88x/CodeAceJumper/blob/master/src/inline-input.ts#L81

  //Command pallete
  // When a command should be available: https://code.visualstudio.com/api/extension-guides/command#controlling-when-a-command-shows-up-in-the-command-palette
  //   https://code.visualstudio.com/api/extension-guides/command#enablement-of-commands
  // Dynamic selection, filter with executeCommand("workbench.action.quickOpen", ">commandPREFIX");

  // Helm like branch selector: QuickPick https://code.visualstudio.com/api/references/vscode-api#QuickInput
      // window.showQuickPick(repository.state.refs.map( r => r.name!));
      //   repository.checkout(branch.name)

  // Name stuff: InputBox

  // Diff: language mode "diff"

  // Commit message: language mode "git-commit message"
  //       should just open buffer. Git supports this out of the box, like when it opens $EDITOR

  // Folding: https://code.visualstudio.com/api/references/vscode-api#languages.registerFoldingRangeProvider
  // Register <tab> for folding for the language mode!
  // { "key": "tab", "command": "cursorHome", "when": "mightBeUseful to have when

  // Status bar message for git feedback stuff

  // Erorrs: show ErrorMessage for feil

  // VsVim:
  // Needs to work well with VsVim as well

  if (workspace.workspaceFolders && workspace.workspaceFolders[0]) {

    let gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;
    const gitApi = gitExtension.getAPI(1);

    const rootPath = workspace.workspaceFolders[0].uri.fsPath;
    console.log(rootPath);

    const repository = gitApi.repositories.filter(r => isDescendant(r.rootUri.fsPath, rootPath))[0];

    // repository.diff()
    repository.status()
      .then(console.log)
      .then(() => {
        //console.log(repository.state.indexChanges);
        console.log(repository.state.HEAD);
        console.log(repository.state.remotes);
        console.log(repository.state.refs)
        console.log(repository.state.workingTreeChanges)

      });

    const provider = new ContentProvider(repository);

    const providerRegistrations = Disposable.from(
      workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider)
    );

    let disposable = commands.registerCommand('extension.magit', async () => {

      const uri = encodeLocation("gitstatus");
      workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.Beside));


      //return commands.executeCommand("workbench.action.quickOpen", ">bdd/halla");

      // window.showInputBox({prompt: "Name of your branch or whatever"});
    });

    context.subscriptions.push(
      provider,
      providerRegistrations,
      disposable
    );
  }
}

// this method is called when your extension is deactivated
export function deactivate() { }
