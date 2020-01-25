import { TextView } from './textView';

export enum Section {
  Untracked = 'Untracked files',
  Unstaged = 'Unstaged changes',
  Staged = 'Staged changes',
  Stashes = 'Stashes',
  RecentCommits = 'Recent commits',
  UnmergedInto = 'Unmerged into',
  UnpulledFrom = 'Unpulled from',
  Merging = 'Merging'
}

export class SectionHeaderView extends TextView {

  constructor(private _section: Section, count?: number) {
    super();
    this.textContent = `${_section.valueOf()}${count ? ' (' + count + ')' : ''}`;
  }

  onClicked() { return undefined; }
}