import { workspace, extensions, commands, ExtensionContext, Disposable } from 'vscode';
import ContentProvider from './contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus } from './commands/statusCommands';
import { MagitState } from './model/magitStatus';

export let magitStates: { [id: string]: MagitState } = {};
export let gitApi: API;

export function activate(context: ExtensionContext) {

  let gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;
  if (!gitExtension.enabled) {
    throw new Error("vscode.git Git extension not enabled");
  }
  // TODO: Ikke sikkert dette er et problem. Kan være magit virker fortsatt!
  // gitExtension.onDidChangeEnablement(enabled => {
  //   if (!enabled) {
  //     throw new Error("vscode.git Git extension was disabled");
  //   }
  // });
  gitApi = gitExtension.getAPI(1);
  // gitExecutablePath = gitApi.git.path;

  const provider = new ContentProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider)
  );
  context.subscriptions.push(
    provider,
    providerRegistrations,
  );

  context.subscriptions.push(commands.registerCommand('extension.magit', magitStatus));
  context.subscriptions.push(commands.registerCommand('extension.magit-help', magitHelp));
  context.subscriptions.push(commands.registerCommand('extension.magit-key-F', async () => {
    // TODO: Options should be dynamically decided based on whether or not they can be done
    // e.g Pull in magit with no remotes results in: e elsewhere
  }));
  context.subscriptions.push(commands.registerCommand('extension.magit-pushing', pushing));
  context.subscriptions.push(commands.registerCommand('extension.magit-key-b', branching));
}

// this method is called when your extension is deactivated
export function deactivate() { }
