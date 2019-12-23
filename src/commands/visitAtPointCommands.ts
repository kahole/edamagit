import { window, TextEditor, Range, workspace, ViewColumn } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import { CommitItemView } from "../views/commits/commitSectionView";
import { DocumentView } from "../views/general/documentView";
import { gitRun } from "../utils/gitRawRunner";
import { CommitDetailView } from "../views/commitDetailView";
import { views } from "../extension";

export async function magitVisitAtPoint(repository: MagitRepository, currentView: DocumentView) {

  let selectedView = currentView.click(window.activeTextEditor!.selection.active);

  console.log(window.activeTextEditor!.selection.active.line);
  console.log(selectedView);

  if (selectedView instanceof CommitItemView) {

    const commit = (selectedView as CommitItemView).commit;

    console.log(repository);

    let result = await gitRun(repository, ["show", commit.hash]);

    console.log(result.stdout);

    // TODO: gitTextUtils.something
    //  then pack into some model

    const uri = CommitDetailView.encodeLocation(commit.hash);

    views.set(uri.toString(), new CommitDetailView(uri, commit));

    workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.One));

  }

  // TODO: UNRELATED TO visitAtPoint.
  // relevant for diff: can use VSCODE diff command to show diff for a file? or something

  // Link-provider can be used for file links.. but it brings with it a lot of functionality and style

}