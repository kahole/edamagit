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

export default class LogView extends DocumentView {

  static UriPath: string = 'log.magit';

  constructor(uri: Uri, log: MagitLog) {
    super(uri);

    this.subViews = [
      new TextView(`Commits in ${log.refName}`),
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
    this.textContent = `${GitTextUtils.shortHash(commit.hash)} ${commit.graph[0]}${GitTextUtils.shortCommitMessage(commit.message)}`.substr(0, 65).padEnd(70) + `${commit.author}`;
      for(let i = 1; i < commit.graph.length; i++) {
        const emptyHashSpace = ' '.repeat(8);
        this.textContent += `\n${emptyHashSpace}${commit.graph[i]}`;
      }
  }
}