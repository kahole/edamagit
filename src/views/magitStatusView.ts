import * as vscode from 'vscode';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';

export default class MagitStatusView extends DocumentView {

  // TODO: probably need dispose for document views
  dispose() {
    throw new Error("Method not implemented.");
  }

  constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, magitState: MagitState) {
    super(uri, emitter);

    if (magitState.HEAD) {
      this.subViews.push(new BranchHeaderView("Head", magitState.HEAD));
    } else {
      this.subViews.push(new TextView("In the beginning there was darkness"));
    }

    this.subViews.push(new TextView("Upstream/Merge/rebase: " + magitState.HEAD?.upstream?.remote + "/" + magitState.HEAD?.upstream?.name + " WHAT COMMIT MSG"));
    this.subViews.push(new TextView("Push: " + magitState.HEAD?.pushRemote?.remote + "/" + magitState.HEAD?.pushRemote?.name + " WHAT COMMIT MSG"));

    this.subViews.push(new LineBreakView());

    if (magitState.untrackedFiles && magitState.untrackedFiles.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges && magitState.workingTreeChanges.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges));
    }

    if (magitState.indexChanges && magitState.indexChanges.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes && magitState.stashes?.length > 0) {
      this.subViews.push(new StashSectionView(magitState.stashes));
    }

    // TODO: if Unmerged into origin/master, show that section
    //    probably something for Unpulled changes as well
    //  otherwise Recent commits:
    if (magitState.log && magitState.log.length > 0) {
      this.subViews.push(new CommitSectionView(magitState.log));
    }
  }

  public triggerUpdate() {
    this.emitter.fire(this.uri);
  }
}