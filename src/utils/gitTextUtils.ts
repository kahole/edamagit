import { MagitChangeHunk } from '../models/magitChangeHunk';
import { FinalLineBreakRegex } from '../common/constants';
import { Uri } from 'vscode';
import { Section } from '../views/general/sectionHeader';

export default class GitTextUtils {

  public static diffToHunks(diff: string, uri: Uri, section: Section): MagitChangeHunk[] {

    const hunksStart = diff.indexOf('@@');
    const diffHeader = diff.slice(0, hunksStart);

    return diff
      .replace(FinalLineBreakRegex, '') // removes extra line break at the end
      .slice(hunksStart)
      .split(/\n(?=^@@.*@@.*$)/gm)
      .map(hunkText => ({ diff: hunkText, diffHeader, uri, section }));
  }

  public static shortHash(hash?: string): string {
    return hash ? hash.slice(0, 7) : '';
  }

  public static shortCommitMessage(commitMessage?: string): string {
    return commitMessage ? commitMessage.split('\n')[0] : '';
  }

  public static changeHunkToPatch(changeHunk: MagitChangeHunk): string {
    return changeHunk.diffHeader + changeHunk.diff + '\n';
  }
}