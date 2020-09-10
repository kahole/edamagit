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
import { CommandPrimer } from './commands/commandPrimer';
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
import { copySectionValueCommand } from './commands/copySectionValueCommands';
import { copyBufferRevisionCommands } from './commands/copyBufferRevisionCommands';
import { submodules } from './commands/submodulesCommands';

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
  context.subscriptions.push(commands.registerTextEditorCommand('magit.help', CommandPrimer.primeRepo(magitHelp, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.commit', CommandPrimer.primeRepo(magitCommit)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.refresh', CommandPrimer.primeRepo(magitRefresh)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.pulling', CommandPrimer.primeRepo(pulling)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.pushing', CommandPrimer.primeRepo(pushing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stashing', CommandPrimer.primeRepo(stashing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.fetching', CommandPrimer.primeRepo(fetching)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.branching', CommandPrimer.primeRepo(branching)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.merging', CommandPrimer.primeRepo(merging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.rebasing', CommandPrimer.primeRepo(rebasing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.resetting', CommandPrimer.primeRepo(resetting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reset-mixed', CommandPrimer.primeRepo(resetMixed)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reset-hard', CommandPrimer.primeRepo(resetHard)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.remoting', CommandPrimer.primeRepo(remoting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.logging', CommandPrimer.primeRepo(logging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.show-refs', CommandPrimer.primeRepo(showRefs)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.diffing', CommandPrimer.primeRepo(diffing)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.tagging', CommandPrimer.primeRepo(tagging)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.cherry-picking', CommandPrimer.primeRepo(cherryPicking)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reverting', CommandPrimer.primeRepo(reverting)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.ignoring', CommandPrimer.primeRepo(ignoring)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.running', CommandPrimer.primeRepo(running)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.worktree', CommandPrimer.primeRepo(worktree)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.submodules', CommandPrimer.primeRepo(submodules)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.process-log', CommandPrimer.primeRepo(processView, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.visit-at-point', CommandPrimer.primeRepoAndView(magitVisitAtPoint, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.apply-at-point', CommandPrimer.primeRepoAndView(magitApplyEntityAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.discard-at-point', CommandPrimer.primeRepoAndView(magitDiscardAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.reverse-at-point', CommandPrimer.primeRepoAndView(reverseAtPoint)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage', CommandPrimer.primeRepoAndView(magitStage)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage-all', CommandPrimer.primeRepoAndView(magitStageAll)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage', CommandPrimer.primeRepoAndView(magitUnstage)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage-all', CommandPrimer.primeRepoAndView(magitUnstageAll)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.file-popup', CommandPrimer.primeFileCommand(filePopup)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.blame-file', CommandPrimer.primeFileCommand(blameFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.diff-file', CommandPrimer.primeFileCommand(diffFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.stage-file', CommandPrimer.primeFileCommand(stageFile)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.unstage-file', CommandPrimer.primeFileCommand(unstageFile)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.copy-section-value', CommandPrimer.primeRepoAndView(copySectionValueCommand)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.copy-buffer-revision', CommandPrimer.primeRepoAndView(copyBufferRevisionCommands)));

  context.subscriptions.push(commands.registerCommand('magit.dispatch', async () => {
    const editor = window.activeTextEditor;
    const repository = await MagitUtils.getCurrentMagitRepo(editor?.document.uri);

    if (repository) {
      const uri = DispatchView.encodeLocation(repository);
      views.set(uri.toString(), new DispatchView(uri));
      return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.showDocumentColumn(), preview: false }));
    }
  }));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.toggle-fold', CommandPrimer.primeRepoAndView(async (repo: MagitRepository, view: DocumentView) => {
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
