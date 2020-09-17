import * as Constants from '../common/constants';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { ChangeSectionView } from './changes/changesSectionView';
import { MagitRepository } from '../models/magitRepository';

export default class SectionDiffView extends DocumentView {

  static UriPath: string = 'staged.magit';

  constructor(uri: Uri, magitState: MagitRepository, private section: Section) {
    super(uri);
    this.provideContent(magitState, true);
  }

  provideContent(magitState: MagitRepository, unfoldAll = false) {

    let changeSection;

    if (this.section === Section.Staged) {

      changeSection = new ChangeSectionView(Section.Staged, magitState.indexChanges, 'sectionDiffView');

    } else {
      changeSection = new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges, 'sectionDiffView');
    }

    // Unfold to show diff
    if (unfoldAll) {
      changeSection.subViews.forEach(changeView => {
        changeView.folded = false;
        changeView.subViews.forEach(hunkView => hunkView.folded = false);
      });
    }

    this.subViews = [
      changeSection
    ];
  }

  public update(state: MagitRepository): void {
    this.provideContent(state);
    this.triggerUpdate();
  }

  static index = 0;
  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${SectionDiffView.UriPath}?${repository.uri.fsPath}#${SectionDiffView.index++}`);
  }
}