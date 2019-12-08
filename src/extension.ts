import { workspace, extensions, commands, ExtensionContext, Disposable } from 'vscode';
import ContentProvider from './contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus } from './commands/statusCommands';
import { magitChoose } from './commands/chooseCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit } from './commands/commitCommands';
import { saveClose } from './commands/macros';

export const magitRepositories: { [id: string]: MagitRepository } = {};

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

  const provider = new ContentProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider)
  );
  context.subscriptions.push(
    provider,
    providerRegistrations,
  );

  context.subscriptions.push(commands.registerCommand('extension.magit', magitStatus));
  context.subscriptions.push(commands.registerCommand('extension.magit-commit', magitCommit));
  context.subscriptions.push(commands.registerCommand('extension.magit-choose', magitChoose));
  context.subscriptions.push(commands.registerCommand('extension.magit-help', magitHelp));
  context.subscriptions.push(commands.registerCommand('extension.magit-key-F', async () => {
    // TODO: Options should be dynamically decided based on whether or not they can be done
    // e.g Pull in magit with no remotes results in: e elsewhere
  }));
  context.subscriptions.push(commands.registerCommand('extension.magit-pushing', pushing));
  context.subscriptions.push(commands.registerCommand('extension.magit-key-b', branching));

  context.subscriptions.push(commands.registerCommand('extension.magit-save-and-close-commit-msg', saveClose));
}

// this method is called when your extension is deactivated
export function deactivate() { }
