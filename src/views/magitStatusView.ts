import * as Constants from '../common/constants';
import { magitConfig } from '../extension';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { LineBreakView } from './general/lineBreakView';
import { Uri } from 'vscode';
import { BranchHeaderSectionView } from './branches/branchHeaderSectionView';
import { MergingSectionView } from './merging/mergingSectionView';
import { UnsourcedCommitSectionView } from './commits/unsourcedCommitsSectionView';
import { MagitRepository } from '../models/magitRepository';
import { RebasingSectionView } from './rebasing/rebasingSectionView';
import { CherryPickingSectionView } from './cherryPicking/cherryPickingSectionView';
import { RevertingSectionView } from './reverting/revertingSectionView';
import { MagitBranch } from '../models/magitBranch';
import { getLatestGitError } from '../commands/commandPrimer';
import { PullRequestSectionView } from './forge/pullRequestSectionView';
import { IssueSectionView } from './forge/issueSectionView';
import { ErrorMessageView } from './errorMessageView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';
  public HEAD?: MagitBranch;

  constructor(uri: Uri, magitState: MagitRepository) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitRepository) {
    this.HEAD = magitState.HEAD;
    this.subViews = [];

    let latestGitError = getLatestGitError(magitState);
    if (latestGitError) {
        this.addSubview(new ErrorMessageView(latestGitError));
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

    if (magitState.untrackedFiles.length && !magitConfig.hiddenStatusSections.has('untracked')) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if ((magitState.workingTreeChanges.length || magitState.mergeChanges.length) && !magitConfig.hiddenStatusSections.has('unstaged')) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, [...magitState.mergeChanges, ...magitState.workingTreeChanges]));
    }

    if (magitState.indexChanges.length && !magitConfig.hiddenStatusSections.has('staged')) {
      this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes?.length && !magitConfig.hiddenStatusSections.has('stashes')) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    const refs = magitState.remotes.reduce((prev, remote) => remote.branches.concat(prev), magitState.branches.concat(magitState.tags));

    if (magitState.HEAD?.upstreamRemote?.ahead?.commits.length && !magitConfig.hiddenStatusSections.has('unmerged')) {
      this.addSubview(new UnsourcedCommitSectionView(Section.UnmergedInto, magitState.HEAD.upstreamRemote, magitState.HEAD.upstreamRemote.ahead, refs));
    } else if (magitState.HEAD?.pushRemote?.ahead?.commits.length && !magitConfig.hiddenStatusSections.has('unpushed')) {
      this.addSubview(new UnsourcedCommitSectionView(Section.UnpushedTo, magitState.HEAD.pushRemote, magitState.HEAD.pushRemote.ahead, refs));
    }
    if (magitState.log.length > 0 && !magitState.HEAD?.upstreamRemote?.ahead?.commits.length && !magitConfig.hiddenStatusSections.has('recent commits')) {
      this.addSubview(new CommitSectionView(Section.RecentCommits, magitState.log.slice(0, 10), refs));
    }

    if (magitState.HEAD?.upstreamRemote?.behind?.commits.length && !magitConfig.hiddenStatusSections.has('unpulled')) {
      this.addSubview(new UnsourcedCommitSectionView(Section.UnpulledFrom, magitState.HEAD.upstreamRemote, magitState.HEAD.upstreamRemote.behind, refs));
    } else if (magitState.HEAD?.pushRemote?.behind?.commits.length) {
      this.addSubview(new UnsourcedCommitSectionView(Section.UnpulledFrom, magitState.HEAD.pushRemote, magitState.HEAD.pushRemote.behind, refs));
    }

    if (magitState.forgeState?.pullRequests?.length && !magitConfig.hiddenStatusSections.has('pull requests')) {
      this.addSubview(new PullRequestSectionView(magitState.forgeState?.pullRequests));
    }

    if (magitState.forgeState?.issues?.length && !magitConfig.hiddenStatusSections.has('issues')) {
      this.addSubview(new IssueSectionView(magitState.forgeState?.issues));
    }
  }

  public update(state: MagitRepository): void {
    this.provideContent(state);
    this.triggerUpdate();
  }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${repository.uri.fsPath}`);
  }
}