
export interface MagitStatus {
  head: string;
  merge?: string;
  push?: string;
  untrackedFiles: string[];
  unstagedChanges: string[];
  stashes: string[];
  recentCommits: string[];
}