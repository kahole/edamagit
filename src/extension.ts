import { workspace, extensions, commands, ExtensionContext, Disposable, languages, window, TextEditor } from 'vscode';
import ContentProvider from './providers/contentProvider';
import { GitExtension, API } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching, showRefs } from './commands/branchingCommands';
import { magitHelp } from './commands/helpCommands';
import { magitStatus, magitRefresh } from './commands/statusCommands';
import { magitVisitAtPoint } from './commands/visitAtPointCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit } from './commands/commitCommands';
import { magitStage, magitStageAll, magitUnstageAll, magitUnstage, stageFile, unstageFile } from './commands/stagingCommands';
import { saveClose, clearSaveClose, quitMagitView } from './commands/macros';
import HighlightProvider from './providers/highlightProvider';
import SemanticTokensProvider from './providers/semanticTokensProvider';
import { Command } from './commands/commandPrimer';
import * as Constants from './common/constants';
import { fetching } from './commands/fetchingCommands';
import { pulling } from './commands/pullingCommands';
import { stashing } from './commands/stashingCommands';
import { DocumentView } from './views/general/documentView';
import { magitApplyEntityAtPoint } from './commands/applyAtPointCommands';
import { magitDiscardAtPoint } from './commands/discardAtPointCommands';
import { merging } from './commands/mergingCommands';
import { rebasing } from './commands/rebasingCommands';
import { filePopup } from './commands/filePopupCommands';
import { DispatchView } from './views/dispatchView';
import MagitUtils from './utils/magitUtils';
import { remoting } from './commands/remotingCommands';
import { logging } from './commands/loggingCommands';
import { MagitProcessLogEntry } from './models/magitProcessLogEntry';
import { processView } from './commands/processCommands';
import { resetting, resetMixed, resetHard } from './commands/resettingCommands';
import { tagging } from './commands/taggingCommands';
import { worktree } from './commands/worktreeCommands';
import { diffing, diffFile } from './commands/diffingCommands';
import { ignoring } from './commands/ignoringCommands';
import { running } from './commands/runningCommands';
import { cherryPicking } from './commands/cherryPickingCommands';
import { reverting } from './commands/revertingCommands';
import { reverseAtPoint } from './commands/reverseAtPointCommands';
import { blameFile } from './commands/blamingCommands';

export const magitRepositories: Map<string, MagitRepository> = new Map<string, MagitRepository>();
export const views: Map<string, DocumentView> = new Map<string, DocumentView>();
export const processLog: MagitProcessLogEntry[] = [];

export let gitApi: API;
export let logPath: string;

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
  logPath = context.logPath;

  context.subscriptions.push(gitApi.onDidCloseRepository(repository => {
    magitRepositories.delete(repository.rootUri.fsPath);
  }));

  const contentProvider = new ContentProvider();
  const highlightProvider = new HighlightProvider();
  const semanticTokensProvider = new SemanticTokensProvider();

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(Constants.MagitUriScheme, contentProvider),
    languages.registerDocumentHighlightProvider(Constants.MagitDocumentSelector, highlightProvider),
    languages.registerDocumentSemanticTokensProvider(Constants.MagitDocumentSelector, semanticTokensProvider, semanticTokensProvider.legend),
  );
  context.subscriptions.push(
    contentProvider,
    providerRegistrations,
  );

  context.subscriptions.push(commands.registerCommand('magit.status', magitStatus));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.help', Command.primeRepo(magitHelp, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.commit', Command.primeRepo(magitCommit)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.refresh', Command.primeRepo(magitRefresh)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.pulling', Command.primeRepo(pulling)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.pushing', Command.primeRepo(pushing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stashing', Command.primeRepo(stashing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.fetching', Command.primeRepo(fetching)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.branching', Command.primeRepo(branching)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.merging', Command.primeRepo(merging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.rebasing', Command.primeRepo(rebasing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.resetting', Command.primeRepo(resetting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reset-mixed', Command.primeRepo(resetMixed)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reset-hard', Command.primeRepo(resetHard)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.remoting', Command.primeRepo(remoting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.logging', Command.primeRepo(logging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.show-refs', Command.primeRepo(showRefs)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.diffing', Command.primeRepo(diffing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.tagging', Command.primeRepo(tagging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.cherry-picking', Command.primeRepo(cherryPicking)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reverting', Command.primeRepo(reverting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.ignoring', Command.primeRepo(ignoring)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.running', Command.primeRepo(running)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.worktree', Command.primeRepo(worktree)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.process-log', Command.primeRepo(processView, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.visit-at-point', Command.primeRepoAndView(magitVisitAtPoint, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.apply-at-point', Command.primeRepoAndView(magitApplyEntityAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.discard-at-point', Command.primeRepoAndView(magitDiscardAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reverse-at-point', Command.primeRepoAndView(reverseAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage', Command.primeRepoAndView(magitStage)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage-all', Command.primeRepoAndView(magitStageAll)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage', Command.primeRepoAndView(magitUnstage)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage-all', Command.primeRepoAndView(magitUnstageAll)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.file-popup', Command.primeFileCommand(filePopup)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.blame-file', Command.primeFileCommand(blameFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.diff-file', Command.primeFileCommand(diffFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage-file', Command.primeFileCommand(stageFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage-file', Command.primeFileCommand(unstageFile)));

  context.subscriptions.push(commands.registerCommand('magit.dispatch', async () => {
    const editor = window.activeTextEditor;
    const repository = await MagitUtils.getCurrentMagitRepo(editor?.document.uri);

    if (repository) {
      const uri = DispatchView.encodeLocation(repository);
      views.set(uri.toString(), new DispatchView(uri));
      return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.showDocumentColumn(), preview: false }));
    }
  }));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.toggle-fold', Command.primeRepoAndView(async (repo: MagitRepository, view: DocumentView) => {
    const selectedView = view.click(window.activeTextEditor!.selection.active);

    if (selectedView?.isFoldable) {
      selectedView.folded = !selectedView.folded;
      view.triggerUpdate();
    }
  }, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.quit', quitMagitView));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.save-and-close-editor', saveClose));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.clear-and-abort-editor', clearSaveClose));
}

export function deactivate() {
}
