import { workspace, extensions, commands, ExtensionContext, Disposable, languages, window } from 'vscode';
import ContentProvider from './providers/contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus } from './commands/statusCommands';
import { magitVisitAtPoint } from './commands/visitAtPointCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit } from './commands/commitCommands';
import { magitStage, magitStageAll, magitUnstageAll, magitUnstage } from './commands/stagingCommands';
import { saveClose } from './commands/macros';
import FoldingRangeProvider from './providers/foldingRangeProvider';
import HighlightProvider from './providers/highlightProvider';
import { CommandPrimer } from './commands/commandPrimer';
import * as Constants from "./common/constants";
import { magitFetch } from './commands/fetchingCommands';
import { pulling } from './commands/pullingCommands';
import { stashing } from './commands/stashingCommands';

export const magitRepositories: Map<string, MagitRepository> = new Map<string, MagitRepository>();
export let gitApi: API;

export function activate(context: ExtensionContext) {

  let gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;
  if (!gitExtension.enabled) {
    throw new Error("vscode.git Git extension not enabled");
  }
  // TODO: Ikke sikkert dette er et problem. Kan være magit virker fortsatt!
  gitExtension.onDidChangeEnablement(enabled => {
    if (!enabled) {
      throw new Error("vscode.git Git extension was disabled");
    }
  });
  gitApi = gitExtension.getAPI(1);

  const contentProvider = new ContentProvider();
  const foldingRangeProvider = new FoldingRangeProvider();
  const highlightProvider = new HighlightProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(Constants.MagitUriScheme, contentProvider),
    languages.registerFoldingRangeProvider(Constants.MagitDocumentSelector, foldingRangeProvider),
    languages.registerDocumentHighlightProvider(Constants.MagitDocumentSelector, highlightProvider)
  );
  context.subscriptions.push(
    contentProvider,
    providerRegistrations,
  );

  context.subscriptions.push(commands.registerCommand('extension.magit', magitStatus));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-commit', CommandPrimer.primeRepoAndView(magitCommit)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-visit-at-point', CommandPrimer.primeRepoAndView(magitVisitAtPoint)));
  context.subscriptions.push(commands.registerCommand('extension.magit-help', magitHelp));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-pulling', CommandPrimer.primeRepoAndView(pulling)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-pushing', CommandPrimer.primeRepoAndView(pushing)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stashing', CommandPrimer.primeRepoAndView(stashing)));

  context.subscriptions.push(commands.registerCommand('extension.magit-fetching', magitFetch));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-branching', CommandPrimer.primeRepoAndView(branching)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stage', CommandPrimer.primeRepoAndView(magitStage)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stage-all', CommandPrimer.primeRepoAndView(magitStageAll)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-unstage', CommandPrimer.primeRepoAndView(magitUnstage)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-unstage-all', CommandPrimer.primeRepoAndView(magitUnstageAll)));

  context.subscriptions.push(commands.registerCommand('extension.magit-save-and-close-commit-msg', saveClose));

  // Move to contentProvider?
  context.subscriptions.push(workspace.onDidSaveTextDocument(() => {
    //TODO: if magitStatusView open:
    magitStatus();
  }));
}

export function deactivate() {
}
