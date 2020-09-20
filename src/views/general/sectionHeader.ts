import { TextView } from './textView';

export enum Section {
  Untracked = 'Untracked files',
  Unstaged = 'Unstaged changes',
  Staged = 'Staged changes',
  Stashes = 'Stashes',
  RecentCommits = 'Recent commits',
  UnmergedInto = 'Unmerged into',
  UnpushedTo = 'Unpushed to',
  UnpulledFrom = 'Unpulled from',
  Merging = 'Merging',
  CherryPicking = 'Cherry Picking',
  Reverting = 'Reverting',
  HEAD = 'HEAD',
  Branches = 'Branches',
  Remote = 'Remote',
  Tags = 'Tags',
  PullRequests = 'Pull Requests',
}

export class SectionHeaderView extends TextView {

  constructor(section: Section, count?: number, extraText?: string) {
    super(`${section.valueOf()}${extraText ? ' ' + extraText + '' : ''}${count ? ' (' + count + ')' : ''}`);
  }

  onClicked() { return undefined; }
}