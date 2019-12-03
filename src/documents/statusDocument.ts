import * as vscode from 'vscode';
import { Repository } from '../typings/git';

export default class StatusDocument {

  private readonly _uri: vscode.Uri;
  private readonly _emitter: vscode.EventEmitter<vscode.Uri>;

  private readonly _lines: string[];

  constructor(uri: vscode.Uri, repository: Repository, emitter: vscode.EventEmitter<vscode.Uri>) {
    this._uri = uri;

    // The ReferencesDocument has access to the event emitter from
    // the containg provider. This allows it to signal changes
    this._emitter = emitter;

    // Start with printing a header and start resolving
    this._lines = [];

    repository.getCommit(repository.state.HEAD!.commit!)
      .then(c => {
        console.log(c.message);
      });

    this._lines.push(`Head: ${repository.state.HEAD!.name} ${repository.state.HEAD!.commit!}`);
    this._lines.push('');
    this._lines.push(`Unstaged changes (${repository.state.workingTreeChanges.length})`);

    let unstagedFiles = repository.state.workingTreeChanges
      .map(change => {
        return change.uri.toString() + "";
      });

    this._lines.push(...unstagedFiles);

    repository.log({ maxEntries: 10 })
      .then(commits => {
        let recentCommits = commits.map(commit =>
          `${commit.hash.slice(0, 5)} ${commit.message}`);

        this._lines.push(`Recent commits`);
        this._lines.push(...recentCommits);

      });
  }

  get value() {
    return this._lines.join('\n');
  }
}