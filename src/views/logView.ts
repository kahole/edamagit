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
import { TokenView } from './general/tokenView';

export default class LogView extends DocumentView {

  isHighlightable = false;
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
    this.subViews = [];

    const msg = GitTextUtils.shortCommitMessage(logEntry.commit.message);
    const textViews: TextView[] = [];
    textViews.push(new TextView(`${hash}${graph}`));

    const refViews: TextView[] = logEntry.refs.map(ref => new TokenView(ref, 'magit-ref-name'));
    if (refViews.length) {
      textViews.push(new TextView('('));
      refViews.forEach((v, idx) => {
        textViews.push(v);
        if (idx < refViews.length - 1) {
          textViews.push(new TextView(', '));
        }
      });
      textViews.push(new TextView(') '));
    }
    this.addSubview(...textViews);

    const availableMsgWidth = 70  - textViews.reduce((prev, v) => prev + v.textContent.length, 0);
    const truncatedAuthor = truncateText(logEntry.author, 17, 18);
    const truncatedMsg = truncateText(msg, availableMsgWidth, availableMsgWidth + 1);
    this.addSubview(new TextView(`${truncatedMsg}${truncatedAuthor}${timeDistance}`));

    // Add the rest of the graph for this commit
    if (logEntry.graph) {
      for (let i = 1; i < logEntry.graph.length; i++) {
        const g = logEntry.graph[i];
        const emptyHashSpace = ' '.repeat(8);
        this.addSubview(new TextView(`\n${emptyHashSpace}${g}`));
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
