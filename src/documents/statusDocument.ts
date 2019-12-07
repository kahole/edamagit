import * as vscode from 'vscode';
import { MagitStatus } from '../model/magitStatus';

export default class StatusDocument {

  private readonly _uri: vscode.Uri;
  private readonly _emitter: vscode.EventEmitter<vscode.Uri>;

  private readonly _lines: string[];

  private readonly SECTION_FOLD_REGION_END: string = '.';

  constructor(uri: vscode.Uri, magitStatus: MagitStatus, emitter: vscode.EventEmitter<vscode.Uri>) {
    this._uri = uri;

    // The ReferencesDocument has access to the event emitter from
    // the containg provider. This allows it to signal changes
    this._emitter = emitter;

    // Start with printing a header and start resolving
    this._lines = [];

    this._lines.push(`Head: ${magitStatus._state.HEAD!.name} ${magitStatus.commitCache[magitStatus._state.HEAD!.commit!].message}`);
    this._lines.push('');

    if (magitStatus.workingTreeChanges) {

      this._lines.push(`Unstaged changes (${magitStatus._state.workingTreeChanges.length})`);

      let unstagedChanges = magitStatus.workingTreeChanges
        .map(change => change.uri.path + "\n" + change.diff);

      this._lines.push(...unstagedChanges);
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.indexChanges) {

      this._lines.push(`Staged changes (${magitStatus._state.indexChanges.length})`);

      let stagedChanges = magitStatus.indexChanges
        .map(change => change.uri.path + "\n" + change.diff);

      this._lines.push(...stagedChanges);
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.log) {
      magitStatus.log
        .forEach(commit => {
          this._lines.push(`Recent commits`);
          this._lines.push(`${commit.hash.slice(0, 7)} ${commit.message}`);
        });
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    this._lines.push('');
  }

  get value() {
    return this._lines.join('\n');
  }
}