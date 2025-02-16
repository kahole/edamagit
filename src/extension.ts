/// <reference types="node" />
import { workspace, extensions, commands, ExtensionContext, Disposable, languages, window, Uri, ConfigurationChangeEvent, FileSystemWatcher } from 'vscode';
import ContentProvider from './providers/contentProvider';
import { GitExtension, API, Repository } from './typings/git';
import { pushing } from './commands/pushingCommands';
import { branching, showRefs } from './commands/branchingCommands';
import { magitDispatch, magitHelp } from './commands/helpCommands';
import { magitStatus, magitRefresh } from './commands/statusCommands';
import { magitVisitAtPoint } from './commands/visitAtPointCommands';
import { MagitRepository } from './models/magitRepository';
import { magitCommit, setCodePath } from './commands/commitCommands';
import { magitStage, magitStageAll, magitUnstageAll, magitUnstage, stageFile, unstageFile } from './commands/stagingCommands';
import {
  saveClose,
  clearSaveClose,
  quitMagitView,
  toggleAllFoldsForChangeViews,
  toggleAllFoldsInChangeSection,
  moveToPreviousEntity,
  moveToNextEntity,
  moveToNextSection,
  moveToPreviousSection,
  moveToNextChange,
  moveToPreviousChange,
  moveToNextHunk,
  moveToPreviousHunk,
  moveToUnstagedChanges,
  moveToStagedChanges,
} from './commands/macros';
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
import { remoting } from './commands/remotingCommands';
import { logging, logFile } from './commands/loggingCommands';
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
import { forgeRefreshInterval } from './forge';
import { bisecting } from './commands/bisectCommands';
import MagitUtils from './utils/magitUtils';

export const magitRepositories: Map<string, MagitRepository> = new Map<string, MagitRepository>();
export const views: Map<string, DocumentView> = new Map<string, DocumentView>();
export const processLog: MagitProcessLogEntry[] = [];

export let gitApi: API;
export let logPath: string;
export let magitConfig: { displayBufferSameColumn?: boolean, forgeEnabled?: boolean, hiddenStatusSections: Set<string>, quickSwitchEnabled?: boolean, gitPath?: string };

// Debouncing Implementation:
// When multiple git operations or file changes occur in rapid succession,
// we want to avoid overwhelming the system with status updates.
// This debouncing mechanism ensures that:
// 1. We wait for a cluster of changes to complete before updating
// 2. We maintain a minimum time between updates (MIN_UPDATE_INTERVAL)
// 3. We cancel pending updates if new changes come in
// 
// The implementation uses two maps:
// - updateTimeouts: Tracks pending update timeouts for each repo
// - lastUpdateTime: Records when each repo was last updated
// This allows us to both debounce rapid changes and enforce a minimum
// interval between updates, improving performance while keeping the
// display responsive.
let updateTimeouts: Map<string, NodeJS.Timeout> = new Map();
let lastUpdateTime: Map<string, number> = new Map();
const MIN_UPDATE_INTERVAL = 1000; // 1 second minimum between updates

// State Tracking Implementation:
// To avoid unnecessary updates, we track meaningful changes in git repository state.
// This mechanism:
// 1. Tracks counts of working tree, index, and merge changes
// 2. Only triggers updates when these counts actually change
// 3. Maintains the last known state for comparison
// 
// The implementation uses a Map to track state per repository:
// - lastKnownStates: Stores the last known count of changes for each type
// This prevents updates when only file contents change but not their status,
// significantly reducing unnecessary refreshes while ensuring important
// changes are reflected immediately.
let lastKnownStates: Map<string, {
  workingTreeCount: number,
  indexCount: number,
  mergeCount: number
}> = new Map();

function hasSignificantStateChange(repo: Repository): boolean {
  const repoPath = repo.rootUri.fsPath;
  const currentState = {
    workingTreeCount: repo.state.workingTreeChanges.length,
    indexCount: repo.state.indexChanges.length,
    mergeCount: repo.state.mergeChanges?.length || 0
  };
  
  const lastState = lastKnownStates.get(repoPath);
  if (!lastState) {
    lastKnownStates.set(repoPath, currentState);
    return true;
  }

  // Only consider it significant if the counts actually changed
  const hasChanged = lastState.workingTreeCount !== currentState.workingTreeCount ||
                    lastState.indexCount !== currentState.indexCount ||
                    lastState.mergeCount !== currentState.mergeCount;

  if (hasChanged) {
    lastKnownStates.set(repoPath, currentState);
  }
  return hasChanged;
}

// File Change Filtering Implementation:
// Not all file changes should trigger a status update. This system
// intelligently filters file changes to:
// 1. Ignore temporary and lock files that don't affect repository state
// 2. Handle git internal files carefully - ignoring routine changes
//    but catching important ones like HEAD and refs
// 3. Prevent update loops from our own status refresh operations
// 
// The filtering uses a path-based approach to:
// - Skip temp files (.tmp, ~, .swp, .lock)
// - Ignore routine git internals (config, logs, hooks)
// - Allow critical git files (HEAD, refs/heads, refs/tags)
// This ensures we stay responsive to important changes while
// avoiding unnecessary updates.
function shouldTriggerUpdate(uri: Uri): boolean {
  const path = uri.path.toLowerCase();
  
  // Always ignore these files
  if (path.endsWith('.tmp') ||
      path.endsWith('~') ||
      path.endsWith('.swp') ||
      path.endsWith('.lock')) {
    return false;
  }

  // Git-related paths to ignore
  if (path.includes('/.git/')) {
    // Ignore most git internal files
    if (path.includes('/config') ||    // git config changes
        path.includes('/index') ||     // git index changes
        path.includes('/logs/') ||     // git logs
        path.includes('/hooks/') ||    // git hooks
        path.includes('/info/')) {     // git info
      return false;
    }

    // But allow updates for some important git files
    if (path.endsWith('/head') ||          // HEAD changes
        path.includes('/refs/heads/') ||    // branch changes
        path.includes('/refs/tags/')) {     // tag changes
      return true;
    }

    return false;
  }

  return true;
}

function debouncedUpdate(repoPath: string, magitRepo: MagitRepository) {
  // Don't update if we're in the middle of a commit or other git operation
  const activeEditor = window.activeTextEditor;
  if (activeEditor?.document.uri.path.endsWith('COMMIT_EDITMSG') ||
      activeEditor?.document.uri.path.includes('/.git/')) {
    return;
  }

  // Check if we've updated too recently
  const now = Date.now();
  const lastUpdate = lastUpdateTime.get(repoPath) || 0;
  if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
    // If an update is already scheduled, let it handle this change
    if (updateTimeouts.has(repoPath)) {
      return;
    }
  }

  const existing = updateTimeouts.get(repoPath);
  if (existing) {
    clearTimeout(existing);
  }

  updateTimeouts.set(repoPath, setTimeout(() => {
    MagitUtils.magitStatusAndUpdate(magitRepo);
    updateTimeouts.delete(repoPath);
    lastUpdateTime.set(repoPath, Date.now());
  }, 1000)); // 1 second debounce
}

function loadConfig() {
  let workspaceConfig = workspace.getConfiguration('magit');

  magitConfig = {
    displayBufferSameColumn: workspaceConfig.get('display-buffer-function') === 'same-column',
    forgeEnabled: workspaceConfig.get('forge-enabled'),
    hiddenStatusSections: readHiddenStatusSections(workspaceConfig.get('hide-status-sections')),
    quickSwitchEnabled: workspaceConfig.get('quick-switch-enabled'),
    gitPath: workspaceConfig.get('git-path')
  };

  let configCodePath: string | undefined = workspaceConfig.get('code-path');
  setCodePath(configCodePath);
}

function readHiddenStatusSections(configEntry: any): Set<string> {
  if (Array.isArray(configEntry)) {
    return new Set(configEntry);
  } else {
    return new Set();
  }
}

export function activate(context: ExtensionContext) {
  const gitExtension = extensions.getExtension<GitExtension>('vscode.git')!;

  // Set up git repository state change watchers
  gitExtension.exports.getAPI(1).repositories.forEach((repo: Repository) => {
    context.subscriptions.push(
      repo.state.onDidChange(() => {
        const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
        if (magitRepo) {
          // Only trigger update if there are actual changes to file counts
          if (hasSignificantStateChange(repo)) {
            debouncedUpdate(repo.rootUri.fsPath, magitRepo);
          }
        }
      })
    );

    // Add file system watchers for the repository
    const fsWatcher = workspace.createFileSystemWatcher(
      repo.rootUri.fsPath + '/**',
      true,  // Ignore changes to dot files (like .git/)
      false, // Don't ignore file creation
      false  // Don't ignore file deletion
    );

    context.subscriptions.push(
      fsWatcher,
      fsWatcher.onDidChange((uri: Uri) => {
        if (shouldTriggerUpdate(uri)) {
          const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
          if (magitRepo) {
            debouncedUpdate(repo.rootUri.fsPath, magitRepo);
          }
        }
      }),
      fsWatcher.onDidCreate((uri: Uri) => {
        if (shouldTriggerUpdate(uri)) {
          const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
          if (magitRepo) {
            debouncedUpdate(repo.rootUri.fsPath, magitRepo);
          }
        }
      }),
      fsWatcher.onDidDelete((uri: Uri) => {
        if (shouldTriggerUpdate(uri)) {
          const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
          if (magitRepo) {
            debouncedUpdate(repo.rootUri.fsPath, magitRepo);
          }
        }
      })
    );
  });

  // Watch for new repositories being opened
  context.subscriptions.push(
    gitExtension.exports.getAPI(1).onDidOpenRepository((repo: Repository) => {
      context.subscriptions.push(
        repo.state.onDidChange(() => {
          const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
          if (magitRepo) {
            // Only trigger update if there are actual changes to file counts
            if (hasSignificantStateChange(repo)) {
              debouncedUpdate(repo.rootUri.fsPath, magitRepo);
            }
          }
        })
      );

      // Add file system watchers for new repositories
      const fsWatcher = workspace.createFileSystemWatcher(
        repo.rootUri.fsPath + '/**',
        true,  // Ignore changes to dot files (like .git/)
        false, // Don't ignore file creation
        false  // Don't ignore file deletion
      );

      context.subscriptions.push(
        fsWatcher,
        fsWatcher.onDidChange((uri: Uri) => {
          if (shouldTriggerUpdate(uri)) {
            const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
            if (magitRepo) {
              debouncedUpdate(repo.rootUri.fsPath, magitRepo);
            }
          }
        }),
        fsWatcher.onDidCreate((uri: Uri) => {
          if (shouldTriggerUpdate(uri)) {
            const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
            if (magitRepo) {
              debouncedUpdate(repo.rootUri.fsPath, magitRepo);
            }
          }
        }),
        fsWatcher.onDidDelete((uri: Uri) => {
          if (shouldTriggerUpdate(uri)) {
            const magitRepo = magitRepositories.get(repo.rootUri.fsPath);
            if (magitRepo) {
              debouncedUpdate(repo.rootUri.fsPath, magitRepo);
            }
          }
        })
      );
    })
  );

  loadConfig();
  workspace.onDidChangeConfiguration((configChangedEvent: ConfigurationChangeEvent) => {
    if (configChangedEvent.affectsConfiguration('magit')) {
      loadConfig();
    }
  });

  context.subscriptions.push(gitExtension.exports.onDidChangeEnablement((enabled: boolean) => {
    if (!enabled) {
      throw new Error('vscode.git Git extension was disabled');
    }
  }));

  gitApi = gitExtension.exports.getAPI(1);
  logPath = context.logUri.fsPath;

  gitApi.repositories.forEach((repository: Repository) => {
    // Initialize repositories without creating MagitRepository instances yet
    magitRepositories.set(repository.rootUri.fsPath, null as unknown as MagitRepository);
  });

  context.subscriptions.push(gitApi.onDidCloseRepository((repository: Repository) => {
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

  context.subscriptions.push(
    commands.registerCommand('magit.status', magitStatus),
    commands.registerTextEditorCommand('magit.help', CommandPrimer.primeRepo(magitHelp, false)),
    commands.registerTextEditorCommand('magit.dispatch', CommandPrimer.primeRepo(magitDispatch, false)),

    commands.registerTextEditorCommand('magit.commit', CommandPrimer.primeRepo(magitCommit)),
    commands.registerTextEditorCommand('magit.refresh', CommandPrimer.primeRepo(magitRefresh)),
    commands.registerTextEditorCommand('magit.pulling', CommandPrimer.primeRepo(pulling)),
    commands.registerTextEditorCommand('magit.pushing', CommandPrimer.primeRepo(pushing)),
    commands.registerTextEditorCommand('magit.stashing', CommandPrimer.primeRepo(stashing)),
    commands.registerTextEditorCommand('magit.fetching', CommandPrimer.primeRepo(fetching)),
    commands.registerTextEditorCommand('magit.branching', CommandPrimer.primeRepo(branching)),
    commands.registerTextEditorCommand('magit.merging', CommandPrimer.primeRepo(merging)),
    commands.registerTextEditorCommand('magit.rebasing', CommandPrimer.primeRepo(rebasing)),
    commands.registerTextEditorCommand('magit.resetting', CommandPrimer.primeRepo(resetting)),
    commands.registerTextEditorCommand('magit.reset-mixed', CommandPrimer.primeRepo(resetMixed)),
    commands.registerTextEditorCommand('magit.reset-hard', CommandPrimer.primeRepo(resetHard)),
    commands.registerTextEditorCommand('magit.remoting', CommandPrimer.primeRepo(remoting)),
    commands.registerTextEditorCommand('magit.logging', CommandPrimer.primeRepo(logging, false)),
    commands.registerTextEditorCommand('magit.show-refs', CommandPrimer.primeRepo(showRefs, false)),
    commands.registerTextEditorCommand('magit.diffing', CommandPrimer.primeRepo(diffing, false)),
    commands.registerTextEditorCommand('magit.tagging', CommandPrimer.primeRepo(tagging)),
    commands.registerTextEditorCommand('magit.cherry-picking', CommandPrimer.primeRepo(cherryPicking)),
    commands.registerTextEditorCommand('magit.reverting', CommandPrimer.primeRepo(reverting)),
    commands.registerTextEditorCommand('magit.ignoring', CommandPrimer.primeRepo(ignoring)),
    commands.registerTextEditorCommand('magit.running', CommandPrimer.primeRepo(running)),
    commands.registerTextEditorCommand('magit.worktree', CommandPrimer.primeRepo(worktree)),
    commands.registerTextEditorCommand('magit.submodules', CommandPrimer.primeRepo(submodules)),
    commands.registerTextEditorCommand('magit.process-log', CommandPrimer.primeRepo(processView, false)),
    commands.registerTextEditorCommand('magit.stage-all', CommandPrimer.primeRepo(magitStageAll)),
    commands.registerTextEditorCommand('magit.unstage-all', CommandPrimer.primeRepo(magitUnstageAll)),

    commands.registerTextEditorCommand('magit.visit-at-point', CommandPrimer.primeRepoAndView(magitVisitAtPoint, false)),
    commands.registerTextEditorCommand('magit.apply-at-point', CommandPrimer.primeRepoAndView(magitApplyEntityAtPoint)),
    commands.registerTextEditorCommand('magit.discard-at-point', CommandPrimer.primeRepoAndView(magitDiscardAtPoint)),
    commands.registerTextEditorCommand('magit.reverse-at-point', CommandPrimer.primeRepoAndView(reverseAtPoint)),
    commands.registerTextEditorCommand('magit.stage', CommandPrimer.primeRepoAndView(magitStage)),
    commands.registerTextEditorCommand('magit.unstage', CommandPrimer.primeRepoAndView(magitUnstage)),

    commands.registerTextEditorCommand('magit.file-popup', CommandPrimer.primeFileCommand(filePopup, false)),
    commands.registerTextEditorCommand('magit.blame-file', CommandPrimer.primeFileCommand(blameFile, false)),
    commands.registerTextEditorCommand('magit.diff-file', CommandPrimer.primeFileCommand(diffFile, false)),
    commands.registerTextEditorCommand('magit.log-file', CommandPrimer.primeFileCommand(logFile, false)),
    commands.registerTextEditorCommand('magit.stage-file', CommandPrimer.primeFileCommand(stageFile)),
    commands.registerTextEditorCommand('magit.unstage-file', CommandPrimer.primeFileCommand(unstageFile)),

    commands.registerTextEditorCommand('magit.copy-section-value', CommandPrimer.primeRepoAndView(copySectionValueCommand)),
    commands.registerTextEditorCommand('magit.copy-buffer-revision', CommandPrimer.primeRepoAndView(copyBufferRevisionCommands)),

    commands.registerTextEditorCommand('magit.bisect', CommandPrimer.primeRepoAndView(bisecting))
  );

  context.subscriptions.push(commands.registerTextEditorCommand('magit.toggle-fold', CommandPrimer.primeRepoAndView(async (repo: MagitRepository, view: DocumentView) => {
    const selectedView = view.click(window.activeTextEditor!.selection.active);

    if (selectedView?.isFoldable) {
      selectedView.folded = !selectedView.folded;
      view.triggerUpdate();
    }
  }, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.quit', quitMagitView));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-next-entity', CommandPrimer.primeRepoAndView(moveToNextEntity, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-previous-entity', CommandPrimer.primeRepoAndView(moveToPreviousEntity, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-next-section', CommandPrimer.primeRepoAndView(moveToNextSection, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-previous-section', CommandPrimer.primeRepoAndView(moveToPreviousSection, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-next-change', CommandPrimer.primeRepoAndView(moveToNextChange, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-previous-change', CommandPrimer.primeRepoAndView(moveToPreviousChange, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-next-hunk', CommandPrimer.primeRepoAndView(moveToNextHunk, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-previous-hunk', CommandPrimer.primeRepoAndView(moveToPreviousHunk, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-to-unstaged-changes', CommandPrimer.primeRepoAndView(moveToUnstagedChanges, false)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.move-to-staged-changes', CommandPrimer.primeRepoAndView(moveToStagedChanges, false)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.toggle-all-folds-in-change-section-at-point', CommandPrimer.primeRepoAndView(toggleAllFoldsInChangeSection, true)));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.toggle-all-folds-for-change-views', CommandPrimer.primeRepoAndView(toggleAllFoldsForChangeViews, true)));

  context.subscriptions.push(commands.registerTextEditorCommand('magit.save-and-close-editor', saveClose));
  context.subscriptions.push(commands.registerTextEditorCommand('magit.clear-and-abort-editor', clearSaveClose));

  if (forgeRefreshInterval) {
    clearInterval(forgeRefreshInterval as NodeJS.Timeout);
  }
}

export function deactivate() {
  updateTimeouts.forEach(timeout => clearTimeout(timeout));
  updateTimeouts.clear();
  lastUpdateTime.clear();
  lastKnownStates.clear();  // Clean up state tracking
  if (forgeRefreshInterval) {
    global.clearInterval(forgeRefreshInterval as NodeJS.Timeout);
  }
}
