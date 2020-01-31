import { workspace, extensions, commands, ExtensionContext, Disposable, languages, window } from 'vscode';
import ContentProvider from './providers/contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus, magitRefresh } from './commands/statusCommands';
import { magitVisitAtPoint } from './commands/visitAtPointCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit } from './commands/commitCommands';
import { magitStage, magitStageAll, magitUnstageAll, magitUnstage } from './commands/stagingCommands';
import { saveClose } from './commands/macros';
import FoldingRangeProvider from './providers/foldingRangeProvider';
import HighlightProvider from './providers/highlightProvider';
import { Command } from './commands/commandPrimer';
import * as Constants from './common/constants';
import { fetching } from './commands/fetchingCommands';
import { pulling } from './commands/pullingCommands';
import { stashing } from './commands/stashingCommands';
import { DocumentView } from './views/general/documentView';
import { magitApplyEntityAtPoint } from './commands/applyCommands';
import { magitDiscardAtPoint } from './commands/discardCommands';
import { merging } from './commands/mergingCommands';
import { rebasing } from './commands/rebasingCommands';

export const magitRepositories: Map<string, MagitRepository> = new Map<string, MagitRepository>();
export const views: Map<string, DocumentView> = new Map<string, DocumentView>();
export let gitApi: API;

export function activate(context: ExtensionContext) {

  const gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;
  if (!gitExtension.enabled) {
    throw new Error('vscode.git Git extension not enabled');
  }

  context.subscriptions.push(gitExtension.onDidChangeEnablement(enabled => {
    if (!enabled) {
      throw new Error('vscode.git Git extension was disabled');
    }
  }));

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
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-refresh', Command.primeRepoAndView(magitRefresh)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-commit', Command.primeRepoAndView(magitCommit)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-visit-at-point', Command.primeRepoAndView(magitVisitAtPoint, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-apply-at-point', Command.primeRepoAndView(magitApplyEntityAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-discard-at-point', Command.primeRepoAndView(magitDiscardAtPoint)));

  context.subscriptions.push(commands.registerCommand('extension.magit-help', magitHelp));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-pulling', Command.primeRepoAndView(pulling)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-pushing', Command.primeRepoAndView(pushing)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stashing', Command.primeRepoAndView(stashing)));

  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-fetching', Command.primeRepoAndView(fetching)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-branching', Command.primeRepoAndView(branching)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-merging', Command.primeRepoAndView(merging)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-rebasing', Command.primeRepoAndView(rebasing)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stage', Command.primeRepoAndView(magitStage)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-stage-all', Command.primeRepoAndView(magitStageAll)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-unstage', Command.primeRepoAndView(magitUnstage)));
  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-unstage-all', Command.primeRepoAndView(magitUnstageAll)));

  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-file-popup', (textEditor) => {
    const file = textEditor.document.uri.fsPath;

    // TODO: refactor and show menu
    window.showInformationMessage(file);

  }));

  context.subscriptions.push(commands.registerTextEditorCommand('extension.magit-dispatch', async () => {
    // MINOR: this command should be usable without needing to pull up the status view
    await magitStatus();
    return magitHelp();
  }));

  context.subscriptions.push(commands.registerCommand('extension.magit-save-and-close-commit-msg', saveClose));
}

export function deactivate() {
  // MINOR: clean up? views, repositories etc??
}
