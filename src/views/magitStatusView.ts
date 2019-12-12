import * as vscode from 'vscode';
import { MagitState } from '../models/magitStatus';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { RestView } from './restView';
import { DocumentView } from './abstract/documentView';

export default class MagitStatusView extends DocumentView {

  constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, magitState: MagitState) {
    super(uri, emitter);

    if (magitState.untrackedFiles && magitState.untrackedFiles.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges && magitState.workingTreeChanges.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges));
    }

    if (magitState.indexChanges && magitState.indexChanges.length > 0) {
      this.subViews.push(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    this.subViews.push(new RestView(magitState));
  }

  public triggerUpdate() {
    this.emitter.fire(this.uri);
  }
}