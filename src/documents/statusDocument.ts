import * as vscode from 'vscode';
import { MagitState } from '../model/magitStatus';
import { MagitChange } from "../model/magitChange";
import { Status } from '../typings/git';

export default class StatusDocument {

  private readonly _uri: vscode.Uri;
  private readonly _emitter: vscode.EventEmitter<vscode.Uri>;

  private readonly _lines: string[];

  private readonly SECTION_FOLD_REGION_END: string = '.';

  constructor(uri: vscode.Uri, magitStatus: MagitState, emitter: vscode.EventEmitter<vscode.Uri>) {
    this._uri = uri;

    // The ReferencesDocument has access to the event emitter from
    // the containg provider. This allows it to signal changes
    this._emitter = emitter;

    // Start with printing a header and start resolving
    this._lines = [];

    this._lines.push(`Head: ${magitStatus._state.HEAD!.name} ${magitStatus.commitCache[magitStatus._state.HEAD!.commit!].message}`);
    this._lines.push('');

    if (magitStatus.untrackedFiles) {
      this._lines.push(`Untracked files (${magitStatus.untrackedFiles.length})`);
      let untrackedFiles = this.renderChanges(magitStatus.untrackedFiles);
      this._lines.push(...untrackedFiles);
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.workingTreeChanges) {
      this._lines.push(`Unstaged changes (${magitStatus.workingTreeChanges.length})`);
      let unstagedChanges = this.renderChanges(magitStatus.workingTreeChanges);
      this._lines.push(...unstagedChanges);
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.indexChanges) {
      this._lines.push(`Staged changes (${magitStatus.indexChanges.length})`);
      let stagedChanges = this.renderChanges(magitStatus.indexChanges);
      this._lines.push(...stagedChanges);
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.stashes) {
      this._lines.push(`Stashes (${magitStatus.stashes.length})`);
      magitStatus.stashes
        .forEach(stash => {
          this._lines.push(`stash@{${stash.index}} ${stash.description}`);
        });
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.log) {
      this._lines.push(`Recent commits`);
      magitStatus.log
        .forEach(commit => {
          this._lines.push(`${commit.hash.slice(0, 7)} ${commit.message}`);
        });
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    this._lines.push('');
  }

  private renderChanges(changes: MagitChange[]) : string[] {
    return changes
      .map(change => `${mapFileStatusToLabel(change.status)} ${change.uri.path}${change.diff ? '\n' + change.diff : ''}`);
  }

  get value() {
    return this._lines.join('\n');
  }
}

function mapFileStatusToLabel(status: Status): string {
  switch (status) {
    case Status.INDEX_MODIFIED:
    case Status.MODIFIED:
      return "modified";
    case Status.INDEX_ADDED:
      return "added";
    case Status.INDEX_DELETED:
    case Status.DELETED:
      return "deleted";
    case Status.INDEX_RENAMED:
      return "renamed";
    case Status.INDEX_COPIED:
      return "copied";
    case Status.UNTRACKED:
      return "";
    default:
      return "";
  }
}