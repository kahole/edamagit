import { window, TextEditor, Range, workspace, ViewColumn, Uri } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { CommitDetailView } from '../views/commitDetailView';
import { views } from '../extension';
import { StashItemView } from '../views/stashes/stashSectionView';
import { StashDetailView } from '../views/stashDetailView';
import { ChangeView } from '../views/changes/changeView';
import { MagitCommit } from '../models/magitCommit';

export async function magitVisitAtPoint(repository: MagitRepository, currentView: DocumentView) {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);


  if (selectedView instanceof ChangeView) {

    const change = (selectedView as ChangeView).change;
    workspace.openTextDocument(change.uri).then(doc => window.showTextDocument(doc, ViewColumn.One));

  } else if (selectedView instanceof CommitItemView) {

    const commit: MagitCommit = (selectedView as CommitItemView).commit;

    const result = await gitRun(repository, ['show', commit.hash]);

    commit.diff = result.stdout;

    const uri = CommitDetailView.encodeLocation(commit.hash);

    views.set(uri.toString(), new CommitDetailView(uri, commit));

    workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.One));

  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;
    const uri = StashDetailView.encodeLocation(repository, stash);

    views.set(uri.toString(), new StashDetailView(uri, stash));
    workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.One));
  }
}