import * as vscode from 'vscode';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './lineBreakView';

export default class MagitStatusView extends DocumentView implements vscode.Disposable {

  dispose() {
    throw new Error("Method not implemented.");
  }
    // workspace.onDidSaveTextDocument(() => {
    //   // TODO:
    //   // Needs cleaning up!
    //   // Should only be when status view open?
    //   // How should other views be stored and handled?
  
    //   let repository = MagitUtils.getCurrentMagitRepo();
  
    //   let currentView = repository?.views?.values().next();
  
    //   if (repository && currentView) {
    //     MagitUtils.magitStatusAndUpdate(repository, currentView as any);
    //   }
    // });

  constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, magitState: MagitState) {
    super(uri, emitter);

    if (magitState.HEAD) {
      this.subViews.push(new BranchHeaderView(magitState.HEAD));
    } else {
      this.subViews.push(new TextView("In the beginning there was darkness"));
    }
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

    if (magitState.log && magitState.log.length > 0) {
      this.subViews.push(new CommitSectionView(magitState.log));
    }
  }

  public triggerUpdate() {
    this.emitter.fire(this.uri);
  }
}