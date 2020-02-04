import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section, SectionHeaderView } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView, CommitItemView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';
import { Uri, EventEmitter } from 'vscode';
import { BranchSectionView } from './branches/branchSectionView';
import { MergingSectionView } from './merging/mergingSectionView';
import { UnsourcedCommitSectionView } from './commits/unsourcedCommitsSectionView';
import { MagitRepository } from '../models/magitRepository';
import GitTextUtils from '../utils/gitTextUtils';
import { RebasingSectionView } from './rebasing/rebasingSectionView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitState) {

    this.subViews = [];

    if (magitState.latestGitError) {
      this.addSubview(new TextView(`GitError! ${magitState.latestGitError}`));
      magitState.latestGitError = undefined;
    }

    this.addSubview(new BranchSectionView(magitState.HEAD));

    this.addSubview(new LineBreakView());

    if (magitState.mergingState) {
      this.addSubview(new MergingSectionView(magitState.mergingState));
    }

    if (magitState.rebasingState) {
      this.addSubview(new RebasingSectionView(magitState.rebasingState));
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
      this.addSubview(new CommitSectionView(Section.RecentCommits, magitState.log));
    }
  }

  public update(repository: MagitRepository): void {
    if (repository.magitState) {
      this.provideContent(repository.magitState);
    }
    this.triggerUpdate();
  }

  static encodeLocation(repository: MagitRepository, ): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${repository.rootUri.fsPath}`);
  }
}