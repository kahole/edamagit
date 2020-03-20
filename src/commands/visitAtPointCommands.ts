import { window, workspace } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { CommitDetailView } from '../views/commitDetailView';
import { views } from '../extension';
import { StashItemView } from '../views/stashes/stashSectionView';
import { ChangeView } from '../views/changes/changeView';
import { MagitCommit } from '../models/magitCommit';
import { HunkView } from '../views/changes/hunkView';
import { BranchListingView } from '../views/branches/branchListingView';
import { RemoteBranchListingView } from '../views/remotes/remoteBranchListingView';
import { TagListingView } from '../views/tags/tagListingView';
import { showStashDetail } from './diffingCommands';

export async function magitVisitAtPoint(repository: MagitRepository, currentView: DocumentView) {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof ChangeView) {

    const change = (selectedView as ChangeView).change;
    workspace.openTextDocument(change.uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preview: false }));
  }
  else if (selectedView instanceof HunkView) {

    const changeHunk = (selectedView as HunkView).changeHunk;
    workspace.openTextDocument(changeHunk.uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preview: false }));

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
    showStashDetail(repository, stash);
  } else {
    window.setStatusBarMessage('There is no thing at point that could be visited', 10000);
  }
}

export async function visitCommit(repository: MagitRepository, commitHash: string) {
  const commit: MagitCommit = { hash: commitHash, message: '', parents: [] };
  const result = await gitRun(repository, ['show', commitHash]);
  commit.diff = result.stdout;

  const uri = CommitDetailView.encodeLocation(repository, commit.hash);
  views.set(uri.toString(), new CommitDetailView(uri, commit));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preview: false }));
}