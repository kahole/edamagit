import { Repository } from "../typings/git";
import { Uri } from "vscode";
import * as cp from "child_process";

interface BaseBaseRepository {
  run?(args: string[], options?: SpawnOptions): Promise<IExecutionResult<string>>;
  // run might become exec, included for future-proofing:
  exec?(args: string[], options?: SpawnOptions): Promise<IExecutionResult<string>>;
}

interface BaseRepository {
  getStashes(): Promise<Stash[]>;
  pushTo(remote?: string, name?: string, setUpstream?: boolean, forcePushMode?: ForcePushMode): Promise<void>;
  add(resources: Uri[], opts?: { update?: boolean }): Promise<void>;
  renameBranch(name: string): Promise<void>;
  // stage(resource: Uri, contents: string): Promise<void>;
  reset(treeish: string, hard?: boolean): Promise<void>;
  repository: BaseBaseRepository;
}

// Repository.prototype.getStashes = function(this: any) {
//   return this._repository.getStashes();
// };

declare module "../typings/git" {
  export interface Repository {
    readonly _repository: BaseRepository;
  }
}

// Repository.prototype.getStashes = function(this: any) {
//   return this._repository.getStashes();
// };

// (Repository.fn as any).getStashes = function () {
//   const _self = this as moment.Moment;
//   return _self.year() - 1911;
// }

// types from /extensions/git/src/git.ts

export interface IExecutionResult<T extends string | Buffer> {
  exitCode: number;
  stdout: T;
  stderr: string;
}

export interface Stash {
  index: number;
  description: string;
}

export enum ForcePushMode {
  Force,
  ForceWithLease
}

export interface SpawnOptions extends cp.SpawnOptions {
  input?: string;
  encoding?: string;
  log?: boolean;
  // cancellationToken?: CancellationToken;
  // onSpawn?: (childProcess: cp.ChildProcess) => void;
}