import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';
import { Uri } from 'vscode';
import { BranchHeaderSectionView } from './branches/branchHeaderSectionView';
import { MergingSectionView } from './merging/mergingSectionView';
import { UnsourcedCommitSectionView } from './commits/unsourcedCommitsSectionView';
import { MagitRepository } from '../models/magitRepository';
import { RebasingSectionView } from './rebasing/rebasingSectionView';
import { CherryPickingSectionView } from './cherryPicking/cherryPickingSectionView';
import { RevertingSectionView } from './reverting/revertingSectionView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitState) {

    this.subViews = [];

    if (magitState.latestGitError) {
      this.addSubview(new TextView(`GitError! ${magitState.latestGitError.split(Constants.LineSplitterRegex)[0]} [ $ for detailed log ]`));
      magitState.latestGitError = undefined;
    }

    this.addSubview(new BranchHeaderSectionView(magitState.HEAD));

    this.addSubview(new LineBreakView());

    if (magitState.mergingState) {
      this.addSubview(new MergingSectionView(magitState.mergingState));
    }

    if (magitState.rebasingState) {
      this.addSubview(new RebasingSectionView(magitState.rebasingState));
    }

    if (magitState.cherryPickingState) {
      this.addSubview(new CherryPickingSectionView(magitState.cherryPickingState, magitState.log));
    }

    if (magitState.revertingState) {
      this.addSubview(new RevertingSectionView(magitState.revertingState, magitState.log));
    }

    if (magitState.untrackedFiles.length) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges.length || magitState.mergeChanges.length) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, [...magitState.mergeChanges, ...magitState.workingTreeChanges]));
    }

    if (magitState.indexChanges.length) {
      this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes?.length) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    if (magitState.HEAD?.ahead || magitState.HEAD?.behind) {

      if (magitState.HEAD?.commitsAhead?.length) {
        this.addSubview(new UnsourcedCommitSectionView(Section.UnmergedInto, magitState.HEAD.upstream!, magitState.HEAD.commitsAhead));
      }

      if (magitState.HEAD?.commitsBehind?.length) {
        this.addSubview(new UnsourcedCommitSectionView(Section.UnpulledFrom, magitState.HEAD.upstream!, magitState.HEAD.commitsBehind));
      }

    } else if (magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(Section.RecentCommits, magitState.log.slice(0, 10)));
    }
  }

  public update(state: MagitState): void {
    this.provideContent(state);
    this.triggerUpdate();
  }

  static encodeLocation(repository: MagitRepository, ): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${repository.rootUri.fsPath}`);
  }
}