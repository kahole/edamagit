import { Uri } from 'vscode';

export interface MagitChangeHunk {
  diff: string;
  diffHeader: string;
  uri: Uri;
}