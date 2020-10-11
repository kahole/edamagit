import { MagitChangeHunk } from '../models/magitChangeHunk';
import { Uri, Selection } from 'vscode';
import * as Constants from '../common/constants';
import { Commit } from '../typings/git';
import { HunkView } from '../views/changes/hunkView';

export default class GitTextUtils {

  public static diffToHunks(diff: string, uri: Uri): MagitChangeHunk[] {

    const hunksStart = diff.indexOf('@@');
    const diffHeader = diff.slice(0, hunksStart);

    return diff
      .replace(Constants.FinalLineBreakRegex, '') // removes extra line break at the end
      .slice(hunksStart)
      .split(/\n(?=^@@.*@@.*$)/gm)
      .map(hunkText => ({ diff: hunkText, diffHeader, uri }));
  }

  public static parseMergeStatus(mergeHead: string, mergeMessage: string): [string, string[]] | undefined {

    const mergingBranches = mergeMessage.match(/'(.*?)'/g)
      ?.map(b => b.slice(1, b.length - 1));

    const commit = mergeHead
      .replace(Constants.FinalLineBreakRegex, '');

    if (mergingBranches) {
      return [commit, mergingBranches];
    }
  }

  public static parseRevListLeftRight(revList: string): [string[], string[]] {

    const left: string[] = [], right: string[] = [];

    revList
      .replace(Constants.FinalLineBreakRegex, '')
      .split(Constants.LineSplitterRegex)
      .forEach(line => {
        switch (line.charAt(0)) {
          case '<':
            left.push(line.slice(1));
            break;
          case '>':
            right.push(line.slice(1));
            break;
          default:
            break;
        }
      });
    return [left, right];
  }

  public static parseSequencerTodo(todo?: string): Commit[] {
    if (!todo) {
      return [];
    }
    return todo.split(Constants.LineSplitterRegex)
      .filter(line => line.charAt(0) !== '#')
      .map(line => {
        const [label, hash, ...messageParts] = line.split(' ');
        return {
          hash,
          message: messageParts.join(' '),
          parents: []
        };
      });
  }

  public static commitDetailTextToCommit(commitText: string): Commit {

    const hashMatch = /(?:^From )(.*?) /gm.exec(commitText);
    const messageMatch = /(?:^Subject: )(.*?)$/gm.exec(commitText);
    const authorMatch = /(?:^From: )(.*?) </gm.exec(commitText);

    return {
      hash: hashMatch?.length && hashMatch?.length > 1 ? hashMatch[1] : '',
      message: messageMatch?.length && messageMatch?.length > 1 ? messageMatch[1] : '',
      parents: [],
      authorEmail: authorMatch?.length && authorMatch?.length > 1 ? authorMatch[1] : '',
    };
  }

  public static remoteBranchFullNameToSegments(remoteBranchName?: string): string[] {

    if (remoteBranchName) {
      const [remote, ...nameParts] = remoteBranchName.split('/');
      const name = nameParts.join('/');
      return [remote, name];
    }

    return ['', ''];
  }

  public static shortHash(hash?: string): string {
    return hash ? hash.slice(0, 7) : '';
  }

  public static shortCommitMessage(commitMessage?: string): string {
    return commitMessage ? commitMessage.split('\n')[0] : '';
  }

  public static generatePatchFromChangeHunkView(hunkView: HunkView, selection?: Selection, reverse = false): string {

    if (!selection || selection.isEmpty) {
      return `${hunkView.changeHunk.diffHeader}${hunkView.changeHunk.diff}\n`;
    }

    let diff = '';
    const changeHunk = hunkView.changeHunk;

    const diffStart = hunkView.range.start.translate(1);
    const diffRange = hunkView.range.with(diffStart);
    const selectedDiffRange = diffRange.intersection(selection);

    if (!selectedDiffRange) {
      diff = changeHunk.diff;
    } else {
      const [fileEditDeclaration, ...diffLines] = changeHunk.diff.split(Constants.LineSplitterRegex);

      const relativeDiffLineStart = selectedDiffRange.start.line - diffStart.line;
      const relativeDiffLineEnd = selectedDiffRange.end.line - diffStart.line;

      const additionRegex = /^\+.*/;
      const deletionRegex = /^-.*/;

      const savedIndices = new Set();
      let savedAdditions = 0;
      let savedDeletions = 0;

      for (let i = relativeDiffLineStart; i <= relativeDiffLineEnd; i++) {
        const diffLine = diffLines[i];
        if (additionRegex.test(diffLine)) {
          savedAdditions++;
        } else if (deletionRegex.test(diffLine)) {
          savedDeletions++;
        } else {
          continue;
        }
        savedIndices.add(i);
      }

      let ignoredAdditions = 0;
      let ignoredDeletions = 0;

      const newDiffLines: string[] = [];
      diffLines
        .forEach((diffLine, i) => {
          if (additionRegex.test(diffLine) && !savedIndices.has(i)) {
            ignoredAdditions++;
            if (reverse) {
              newDiffLines.push(' ' + diffLine.slice(1));
            }
          } else if (deletionRegex.test(diffLine) && !savedIndices.has(i)) {
            ignoredDeletions++;
            if (!reverse) {
              newDiffLines.push(' ' + diffLine.slice(1));
            }
          } else {
            newDiffLines.push(diffLine);
          }
        });

      const newDiff = newDiffLines.join('\n');

      const fromFileExcerptSizeRegex = /(?<=,)\d+(?= \+)/g;
      const toFileExcerptSizeRegex = /(?<=,)\d+(?= @@)/g;

      const originalLineSpanSize = Number.parseInt(fileEditDeclaration.match(fromFileExcerptSizeRegex)![0].toString());

      let newFileEditDeclaration;
      let newLineSpanSize = originalLineSpanSize + (savedAdditions - savedDeletions);

      if (reverse) {

        newFileEditDeclaration = fileEditDeclaration.replace(fromFileExcerptSizeRegex, (originalLineSpanSize + ignoredAdditions - ignoredDeletions).toString());
        newFileEditDeclaration = newFileEditDeclaration.replace(toFileExcerptSizeRegex, (newLineSpanSize + ignoredAdditions - ignoredDeletions).toString());

      } else {
        newFileEditDeclaration = fileEditDeclaration.replace(toFileExcerptSizeRegex, newLineSpanSize.toString());
      }

      diff = `${newFileEditDeclaration}\n${newDiff}`;
    }

    if (diff.split(Constants.LineSplitterRegex).length <= 1) {
      diff = changeHunk.diff;
    }

    return `${changeHunk.diffHeader}${diff}\n`;
  }

  private static truncate(msg: string, maxLength: number): string {
    if (msg.length > maxLength) {
      return msg.substring(0, maxLength - 3) + '...';
    }
    return msg;
  }

  public static formatError(error: any): string {
    let errorMsg: string = error.friendlyMessage ?? error.stderr ?? error.message;
    errorMsg = errorMsg.replace('error: ', '');
    return GitTextUtils.truncate(errorMsg, 350);
  }
}