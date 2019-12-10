import { workspace, extensions, commands, ExtensionContext, Disposable, languages } from 'vscode';
import ContentProvider from './contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus } from './commands/statusCommands';
import { magitVisitAtPoint } from './commands/visitAtPointCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit } from './commands/commitCommands';
import { magitStage, magitStageAll } from './commands/stagingCommands';
import { saveClose } from './commands/macros';
import FoldingRangeProvider from './foldingRangeProvider';

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

  const contentProvider = new ContentProvider();
  const foldingRangeProvider = new FoldingRangeProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(ContentProvider.scheme, contentProvider),
    languages.registerFoldingRangeProvider(FoldingRangeProvider.scheme, foldingRangeProvider)
  );
  context.subscriptions.push(
    contentProvider,
    providerRegistrations,
  );

  context.subscriptions.push(commands.registerCommand('extension.magit', magitStatus));
  context.subscriptions.push(commands.registerCommand('extension.magit-commit', magitCommit));
  context.subscriptions.push(commands.registerCommand('extension.magit-visit-at-point', magitVisitAtPoint));
  context.subscriptions.push(commands.registerCommand('extension.magit-help', magitHelp));
  context.subscriptions.push(commands.registerCommand('extension.magit-pulling', async () => {
    // TODO: Options should be dynamically decided based on whether or not they can be done
    // e.g Pull in magit with no remotes results in: e elsewhere
  }));
  context.subscriptions.push(commands.registerCommand('extension.magit-pushing', pushing));
  context.subscriptions.push(commands.registerCommand('extension.magit-branching', branching));
  context.subscriptions.push(commands.registerCommand('extension.magit-stage', magitStage));
  context.subscriptions.push(commands.registerCommand('extension.magit-stage-all', magitStageAll));

  context.subscriptions.push(commands.registerCommand('extension.magit-save-and-close-commit-msg', saveClose));
}

// this method is called when your extension is deactivated
export function deactivate() { }
