import * as vscode from 'vscode';
import { MagitState } from '../models/magitStatus';
import { MagitChange } from "../models/magitChange";
import { ChangeView } from './changes/changeView';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { View } from './abstract/view';
import { RestView } from './restView';

export default class MagitStatusView extends View {

  onClicked() {}

  private readonly _uri: vscode.Uri;
  private readonly _emitter: vscode.EventEmitter<vscode.Uri>;

  // private readonly _lines: string[];

  private readonly SECTION_FOLD_REGION_END: string = '.';

  constructor(uri: vscode.Uri, magitStatus: MagitState, emitter: vscode.EventEmitter<vscode.Uri>) {
    super();
    this._uri = uri;

    // The ReferencesDocument has access to the event emitter from
    // the containg provider. This allows it to signal changes
    this._emitter = emitter;

    // Start with printing a header and start resolving
    // this._lines = [];

    if (magitStatus.untrackedFiles && magitStatus.untrackedFiles.length > 0) {
      // this._lines.push(`Untracked files (${magitStatus.untrackedFiles.length})`);
      // let untrackedFiles = this.renderChanges(magitStatus.untrackedFiles);
      // this._lines.push(...untrackedFiles);
      // this._lines.push(this.SECTION_FOLD_REGION_END);
      this.subViews.push(new ChangeSectionView(Section.Untracked, magitStatus.untrackedFiles));
    }

    if (magitStatus.workingTreeChanges && magitStatus.workingTreeChanges.length > 0) {

      let unstagedView = new ChangeSectionView(Section.Unstaged, magitStatus.workingTreeChanges);
      this.subViews.push(unstagedView);
      // this._lines.push(...unstagedView.render(0));
      // this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.indexChanges && magitStatus.indexChanges.length > 0) {

      this.subViews.push(new ChangeSectionView(Section.Staged, magitStatus.indexChanges));

      // this._lines.push(`Staged changes (${magitStatus.indexChanges.length})`);
      // let stagedChanges = this.renderChanges(magitStatus.indexChanges);
      // this._lines.push(...stagedChanges);
      // this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    this.subViews.push(new RestView(magitStatus));

  }

  // private renderChanges(changes: MagitChange[]) : string[] {

  //   return changes
  //     .map(change => {

  //       return new ChangeView(change).render(0).join('\n');
        
  //       // let hunkRender = change.hunks ? change.hunks.map( h => h.diff ).join('\n') : '\n';
  //       // return `${mapFileStatusToLabel(change.status)} ${change.uri.path}${hunkRender}`;
  //     });
  // }

  get value() {
    return this.render(0).join('\n');
  }
}