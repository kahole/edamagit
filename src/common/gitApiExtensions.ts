import * as cp from 'child_process';

// This refers to Repository in
// vscode/extension/git/src/git.ts
interface BaseGitRepository {
  exec?(args: string[], options?: SpawnOptions): Promise<IExecutionResult<string>>;
}

// This refers to the Repository in
// vscode/extension/git/src/repository.ts
interface BaseRepository {
  repository: BaseGitRepository;
}

// This refers to ApiRepository from
// vscode/extension/git/src/api/api1.ts
declare module '../typings/git' {
  export interface Repository {
    // Breaking change in VSCode: https://github.com/microsoft/vscode/pull/154555/files#diff-b7c16e46aefbf6182f8be03b099e5c407da09bd345ff2908abddd6bfe90c34aaL65-R65
    // Going from this
    readonly _repository: BaseRepository;
    // to this:
    readonly repository: BaseRepository;
  }
}

// types from /extensions/git/src/git.ts

export interface IExecutionResult<T extends string | Buffer> {
  exitCode: number;
  stdout: T;
  stderr: string;
}

export interface SpawnOptions extends cp.SpawnOptions {
  input?: string;
  encoding?: string;
  log?: boolean;
  // cancellationToken?: CancellationToken;
  // onSpawn?: (childProcess: cp.ChildProcess) => void;
}