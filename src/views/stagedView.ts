import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { ChangeSectionView } from './changes/changesSectionView';
import { MagitRepository } from '../models/magitRepository';
import { TextView } from './general/textView';

export default class StagedView extends DocumentView {

  static UriPath: string = 'staged.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitState) {

    this.subViews = [];
    if (magitState.indexChanges) {

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
    return Uri.parse(`${Constants.MagitUriScheme}:${StagedView.UriPath}?${workspacePath}#${StagedView.index++}`);
  }
}