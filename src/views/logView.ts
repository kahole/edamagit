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
import { Token, SemanticTextView } from './general/semanticTextView';
import { SemanticTokenTypes } from '../common/constants';

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

    this.content = [];

    const msg = GitTextUtils.shortCommitMessage(logEntry.commit.message);
    this.content.push(`${hash}${graph}`);

    const refTokens: Token[] = logEntry.refs.map(ref => new Token(ref, SemanticTokenTypes.RefName));
    if (refTokens.length) {

      this.content.push(' (');
      refTokens.forEach(refToken => {
        this.content.push(refToken, ' ');
      });
      this.content.pop();

      this.content.push(') ');
    }

    const availableMsgWidth = 70 - this.content.reduce((prev, v) => prev + v.length, 0);
    const truncatedAuthor = truncateText(logEntry.author, 17, 18);
    const truncatedMsg = truncateText(msg, availableMsgWidth, availableMsgWidth + 1);
    this.content.push(`${truncatedMsg}${truncatedAuthor}${timeDistance}`);

    // Add the rest of the graph for this commit
    if (logEntry.graph) {
      for (let i = 1; i < logEntry.graph.length; i++) {
        const g = logEntry.graph[i];
        const emptyHashSpace = ' '.repeat(8);
        this.content.push(`\n${emptyHashSpace}${g}`);
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
