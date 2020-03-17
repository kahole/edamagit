import { TextView } from './textView';

export enum Section {
  Untracked = 'Untracked files',
  Unstaged = 'Unstaged changes',
  Staged = 'Staged changes',
  Stashes = 'Stashes',
  RecentCommits = 'Recent commits',
  UnmergedInto = 'Unmerged into',
  UnpulledFrom = 'Unpulled from',
  Merging = 'Merging',
  CherryPicking = 'Cherry Picking',
  Reverting = 'Reverting',
  HEAD = 'HEAD',
  Branches = 'Branches',
  Remote = 'Remote',
  Tags = 'Tags'
}

export class SectionHeaderView extends TextView {

  constructor(private _section: Section, count?: number, extraText?: string) {
    super(`${_section.valueOf()}${extraText ? ' ' + extraText + '' : ''}${count ? ' (' + count + ')' : ''}`);
  }

  onClicked() { return undefined; }
}