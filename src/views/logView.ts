import * as Constants from '../common/constants';
import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { TextView } from './general/textView';
import { CommitItemView } from './commits/commitSectionView';
import { MagitLog } from '../models/magitLog';
import { Commit } from '../typings/git';
import GitTextUtils from '../utils/gitTextUtils';
import { MagitState } from '../models/magitState';
import { LogCommit } from '../commands/loggingCommands';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';

export default class LogView extends DocumentView {

  static UriPath: string = 'log.magit';

  constructor(uri: Uri, log: MagitLog) {
    super(uri);

    this.subViews = [
      new TextView(`Commits in ${log.revName}`),
      ...log.commits.map(commit => new CommitLongFormItemView(commit)),
    ];
  }

  public update(state: MagitState): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${LogView.UriPath}?${repository.rootUri.fsPath}#${LogView.index++}`);
  }
}

export class CommitLongFormItemView extends CommitItemView {

  constructor(public commit: LogCommit) {
    super(commit);
    const timeDistance = formatDistanceToNowStrict(commit.time);
    const hash = `${GitTextUtils.shortHash(commit.hash)} `;
    const graph = commit.graph?.[0] ?? '';
    const refs = commit.refs ? `(${commit.refs}) ` : '';
    const msg = GitTextUtils.shortCommitMessage(commit.message);
    this.textContent = truncateText(`${hash}${graph}${refs}${msg}`, 69, 70) +
      truncateText(commit.author, 17, 18) +
      timeDistance;

    // Add the rest of the graph for this commit
    if (commit.graph) {
      for (let i = 1; i < commit.graph.length; i++) {
        const g = commit.graph[i];
        const emptyHashSpace = ' '.repeat(8);
        this.textContent += `\n${emptyHashSpace}${g}`;
      }
    }
  }
}

function truncateText(txt: string, limit: number, padEnd?: number) {
  let ret = (txt.length >= limit) ? txt.substr(0, limit - 1) + '…' : txt;
  if (padEnd) {
    ret = ret.padEnd(padEnd);
  }
  return ret;
}