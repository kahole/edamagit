import * as vscode from 'vscode';
import { MagitState } from '../models/magitStatus';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { RestView } from './restView';
import { DocumentView } from './abstract/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';

export default class MagitStatusView extends DocumentView {

  constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, magitState: MagitState) {
    super(uri, emitter);

    this.subViews.push(new RestView(magitState));

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