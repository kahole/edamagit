import { window, workspace, TextEditorRevealType, Range, Position, Selection, commands } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { CommitDetailView } from '../views/commitDetailView';
import { StashItemView } from '../views/stashes/stashSectionView';
import { ChangeView } from '../views/changes/changeView';
import { MagitCommit } from '../models/magitCommit';
import { HunkView } from '../views/changes/hunkView';
import { BranchListingView } from '../views/branches/branchListingView';
import { RemoteBranchListingView } from '../views/remotes/remoteBranchListingView';
import { TagListingView } from '../views/tags/tagListingView';
import * as Diffing from './diffingCommands';
import * as Constants from '../common/constants';
import ViewUtils from '../utils/viewUtils';
import { IssueItemView } from '../views/forge/issueSectionView';
import { IssueView } from '../views/forge/issueView';
import { PullRequestItemView } from '../views/forge/pullRequestSectionView';
import { PullRequestView } from '../views/forge/pullRequestView';
import { sep } from 'path';
import { ErrorMessageView } from '../views/errorMessageView';
import { processView } from './processCommands';
import { stashToMagitChanges } from './diffingCommands';

export async function magitVisitAtPoint(repository: MagitRepository, currentView: DocumentView) {

  const activePosition = window.activeTextEditor?.selection.active;

  if (!activePosition) {
    return;
  }

  const selectedView = currentView.click(activePosition);

  if (selectedView instanceof ChangeView) {

    const change = (selectedView as ChangeView).change;

    if (change.hunks?.length) {
      return visitHunk(selectedView.subViews.find(v => v instanceof HunkView) as HunkView);
    } else {

      // Check if change path is a directory. Reveal directories in file explorer
      if (change.relativePath?.endsWith(sep)) {
        return commands.executeCommand('revealInExplorer', change.uri);
      } else {
        return workspace.openTextDocument(change.uri).then(doc => window.showTextDocument(doc, { viewColumn: ViewUtils.showDocumentColumn(), preview: false }));
      }
    }
  }
  else if (selectedView instanceof HunkView) {

    return visitHunk(selectedView, activePosition);

  } else if (selectedView instanceof CommitItemView) {

    const commit: MagitCommit = (selectedView as CommitItemView).commit;
    return visitCommit(repository, commit.hash);

  } else if (selectedView instanceof BranchListingView ||
    selectedView instanceof RemoteBranchListingView ||
    selectedView instanceof TagListingView) {

    const commit = (selectedView as BranchListingView).ref.commit;
    return visitCommit(repository, commit!);

  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;
    return Diffing.showStashDetail(repository, stash);


  } else if (selectedView instanceof IssueItemView) {

    const issue = (selectedView as IssueItemView).issue;
    const uri = IssueView.encodeLocation(repository, issue);
    let issueView = ViewUtils.createOrUpdateView(repository, uri, () => new IssueView(uri, issue));

    return ViewUtils.showView(uri, issueView);

  } else if (selectedView instanceof PullRequestItemView) {

    const pullRequest = (selectedView as PullRequestItemView).pullRequest;
    const uri = PullRequestView.encodeLocation(repository, pullRequest);
    let pullRequestView = ViewUtils.createOrUpdateView(repository, uri, () => new PullRequestView(uri, pullRequest));

    return ViewUtils.showView(uri, pullRequestView);

  } else if (selectedView instanceof ErrorMessageView) {
    return processView(repository);
  } else {
    window.setStatusBarMessage('There is no thing at point that could be visited', Constants.StatusMessageDisplayTimeout);
  }
}

async function visitHunk(selectedView: HunkView, activePosition?: Position) {

  const changeHunk = selectedView.changeHunk;

  const doc = await workspace.openTextDocument(changeHunk.uri);
  const editor = await window.showTextDocument(doc, { viewColumn: ViewUtils.showDocumentColumn(), preview: false });

  try {
    const startLineMatches = changeHunk.diff.match(/(?<=\+)\d+(?=,)/g);

    if (startLineMatches?.length) {

      const diffStartLineInFile = Number.parseInt(startLineMatches[0].toString()) - 1; // -1 to translate to zero-based line numbering

      let activeLineRelativeToDiff = 0;
      let relevantCharacterSelection = 0;
      if (activePosition && activePosition.line > selectedView.range.start.line) {

        activeLineRelativeToDiff = activePosition.line - (selectedView.range.start.line + 1); // +1 to get past line denoting start line of diff hunk
        relevantCharacterSelection = activePosition.character > 0 ? activePosition.character - 1 : activePosition.character;

      } else {

        const splitAtAdditions = changeHunk.diff.split(/^\+/gm);
        if (splitAtAdditions.length > 1) {
          activeLineRelativeToDiff = splitAtAdditions[0].split(Constants.LineSplitterRegex).length - 2;
        } else {
          const splitAtDeletions = changeHunk.diff.split(/^-/gm);
          if (splitAtDeletions.length) {
            activeLineRelativeToDiff = splitAtDeletions[0].split(Constants.LineSplitterRegex).length - 2;
          }
        }

        relevantCharacterSelection = 0;
      }

      const numDeletedLinesAboveActiveLine = changeHunk.diff.split(Constants.LineSplitterRegex).slice(0, activeLineRelativeToDiff + 1).filter(line => line.charAt(0) === '-').length;
      const relevantPositionInFile = new Position(diffStartLineInFile + activeLineRelativeToDiff - numDeletedLinesAboveActiveLine, relevantCharacterSelection);

      let relevantSelection = new Selection(relevantPositionInFile, relevantPositionInFile);

      editor.revealRange(new Range(relevantPositionInFile, relevantPositionInFile), TextEditorRevealType.InCenterIfOutsideViewport);
      editor.selection = relevantSelection;
    }
  } catch { }
}

export async function visitCommit(repository: MagitRepository, commitHash: string) {
  const nameStatus = await gitRun(repository.gitRepository, ['show', '--name-status', '--pretty=format:', commitHash]);
  const header = await gitRun(repository.gitRepository, ['show', '-s', '--shortstat', commitHash]);
  const diffs = await gitRun(repository.gitRepository, ['show', '--pretty=format:', commitHash]);
  const commit: MagitCommit = { hash: commitHash, message: '', parents: [] };

  const uri = CommitDetailView.encodeLocation(repository, commit.hash);
  return ViewUtils.showView(uri, new CommitDetailView(uri, commit, header.stdout, stashToMagitChanges(repository, nameStatus.stdout, diffs.stdout)));
}