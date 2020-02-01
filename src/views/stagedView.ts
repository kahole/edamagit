import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { Uri, EventEmitter } from 'vscode';
import { ChangeSectionView } from './changes/changesSectionView';
import { MagitRepository } from '../models/magitRepository';

export default class MagitStagedView extends DocumentView {

  static UriPath: string = 'staged.magit';
  needsUpdate = false;

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitState) {

    this.subViews = [];
    if (magitState.indexChanges && magitState.indexChanges.length > 0) {

      this.subViews = [
        new ChangeSectionView(Section.Staged, magitState.indexChanges)
      ];
    }
  }

  public update(repository: MagitRepository): void {
    if (repository.magitState) {
      this.provideContent(repository.magitState);
    }
    this.triggerUpdate();
  }

  static index = 0;
  static encodeLocation(workspacePath: string): Uri {
    // TODO: need index to avoid duplication bug, so have to make a smarter decoder. Should be same format for every view
    // return Uri.parse(`${Constants.MagitUriScheme}:${MagitStagedView.UriPath}?path=${workspacePath}&index=${MagitStagedView.index++}`);
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStagedView.UriPath}?${workspacePath}`);
  }
}