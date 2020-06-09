import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { MagitLog } from '../models/magitLog';
import { MagitLogEntry } from '../models/magitLogCommit';
import { MagitRepository } from '../models/magitRepository';
import { MagitState } from '../models/magitState';
import GitTextUtils from '../utils/gitTextUtils';
import { CommitItemView } from './commits/commitSectionView';
import { DocumentView } from './general/documentView';
import { TextView } from './general/textView';

export default class LogView extends DocumentView {

  static UriPath: string = 'log.magit';

  constructor(uri: Uri, log: MagitLog) {
    super(uri);

    this.subViews = [
      new TextView(`Commits in ${log.revName}`),
      ...log.entries.map(entry => new CommitLongFormItemView(entry)),
    ];
  }

  public update(state: MagitState): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${LogView.UriPath}?${repository.rootUri.fsPath}#${LogView.index++}`);
  }
}

export class CommitLongFormItemView extends CommitItemView {

  constructor(public logEntry: MagitLogEntry) {
    super(logEntry.commit);
    const timeDistance = formatDistanceToNowStrict(logEntry.time);
    const hash = `${GitTextUtils.shortHash(logEntry.commit.hash)} `;
    const graph = logEntry.graph?.[0] ?? '';
    const refs = logEntry.refs ? `(${logEntry.refs}) ` : '';
    const msg = GitTextUtils.shortCommitMessage(logEntry.commit.message);
    this.textContent = truncateText(`${hash}${graph}${refs}${msg}`, 69, 70) +
      truncateText(logEntry.author, 17, 18) +
      timeDistance;

    // Add the rest of the graph for this commit
    if (logEntry.graph) {
      for (let i = 1; i < logEntry.graph.length; i++) {
        const g = logEntry.graph[i];
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