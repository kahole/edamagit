import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';
import { Uri, EventEmitter } from 'vscode';
import { RemoteBranchHeaderView } from './branches/remoteBranchHeaderView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);

    if (magitState.latestGitError) {
      this.addSubview(new TextView(`GitError! ${magitState.latestGitError}`));
    }

    if (magitState.HEAD?.commit) {
      this.addSubview(new BranchHeaderView('Head', magitState.HEAD));

      if (magitState.HEAD.upstream) {
        this.addSubview(new RemoteBranchHeaderView('Upstream', magitState.HEAD.upstream));
      }

      if (magitState.HEAD.pushRemote) {
        this.addSubview(new RemoteBranchHeaderView('Push', magitState.HEAD.pushRemote));
      }

      // TODO: Rebasing status. Instead of upstream or how does that go? same for merge
      if (magitState.rebaseCommit) {
        // magitState.rebaseCommit.message

        // example:
        // Rebasing {branch} onto {branch}
        // join somethind
        // done something
        // onto something
      }

      // TODO: Merging status
      if (magitState.mergeChanges.length > 0) {
        // this.addSubview(new BranchHeaderView('Merging', { name: magitState.mergeBase }));
      }

    } else {
      this.addSubview(new TextView('In the beginning there was darkness'));
    }

    this.addSubview(new LineBreakView());

    if (magitState.untrackedFiles.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges));
    }

    if (magitState.indexChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Staged, [...magitState.mergeChanges, ...magitState.indexChanges]));
    }

    if (magitState.stashes?.length > 0) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    if (magitState.HEAD?.ahead || magitState.HEAD?.behind) {

      // TODO: these dont get data yet in statusCommands.ts
      // umerged into section
      // and Unpulled from
      if (magitState.HEAD?.commitsAhead) {
        this.addSubview(new CommitSectionView(Section.UnmergedInto, magitState.HEAD.commitsAhead));
      }

      if (magitState.HEAD?.commitsBehind) {
        this.addSubview(new CommitSectionView(Section.UnpulledFrom, magitState.HEAD.commitsBehind));
      }

    } else if (magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(Section.RecentCommits, magitState.log));
    }
  }

  static encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${workspacePath}`);
  }
}