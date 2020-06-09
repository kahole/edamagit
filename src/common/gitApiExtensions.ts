import { Uri } from 'vscode';
import * as cp from 'child_process';

// This refers to Repository in
// vscode/extension/git/src/git.ts
interface BaseGitRepository {
  run?(args: string[], options?: SpawnOptions): Promise<IExecutionResult<string>>;
  // run might become exec, included for future-proofing:
  exec?(args: string[], options?: SpawnOptions): Promise<IExecutionResult<string>>;
}

// This refers to the Repository in
// vscode/extension/git/src/repository.ts
interface BaseRepository {
  getStashes(): Promise<Stash[]>;
  add(resources: Uri[], opts?: { update?: boolean }): Promise<void>;
  reset(treeish: string, hard?: boolean): Promise<void>;
  repository: BaseGitRepository;
}

// This refers to ApiRepository from
// vscode/extension/git/src/api/api1.ts
declare module '../typings/git' {
  export interface Repository {
    readonly _repository: BaseRepository;
  }
}

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

export interface SpawnOptions extends cp.SpawnOptions {
  input?: string;
  encoding?: string;
  log?: boolean;
  // cancellationToken?: CancellationToken;
  // onSpawn?: (childProcess: cp.ChildProcess) => void;
}