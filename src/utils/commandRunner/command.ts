import * as cp from 'child_process';
import { CancellationToken, Disposable, Event, Uri } from 'vscode';
import * as path from 'path';
import { findGit } from './findGit';
import * as iconv from '@vscode/iconv-lite-umd';
import { dispose, IDisposable, toDisposable } from './disposable';
import { magitConfig } from '../../extension';
import { GitConfigOverrideArgs } from '../../common/constants';

const canceledName = 'Canceled';
class CancellationError extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
}

export interface SpawnOptions extends Omit<cp.SpawnOptions, 'cwd'> {
  input?: string;
  encoding?: string;
  log?: boolean;
  cancellationToken?: CancellationToken;
  onSpawn?: (childProcess: cp.ChildProcess) => void;
  cwd?: string | Uri;
}


interface IGitErrorData {
  error?: Error;
  message?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  gitErrorCode?: string;
  gitCommand?: string;
  gitArgs?: string[];
}

class GitError {

  error?: Error;
  message: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  gitErrorCode?: string;
  gitCommand?: string;
  gitArgs?: string[];

  constructor(data: IGitErrorData) {
    if (data.error) {
      this.error = data.error;
      this.message = data.error.message;
    } else {
      this.error = undefined;
      this.message = '';
    }

    this.message = this.message || data.message || 'Git error';
    this.stdout = data.stdout;
    this.stderr = data.stderr;
    this.exitCode = data.exitCode;
    this.gitErrorCode = data.gitErrorCode;
    this.gitCommand = data.gitCommand;
    this.gitArgs = data.gitArgs;
  }

  toString(): string {
    let result = this.message + ' ' + JSON.stringify({
      exitCode: this.exitCode,
      gitErrorCode: this.gitErrorCode,
      gitCommand: this.gitCommand,
      stdout: this.stdout,
      stderr: this.stderr
    }, null, 2);

    if (this.error) {
      result += (<any>this.error).stack;
    }

    return result;
  }
}

export interface IExecutionResult<T extends string | Buffer> {
  exitCode: number;
  stdout: T;
  stderr: string;
}

export function cpErrorHandler(cb: (reason?: any) => void): (reason?: any) => void {
  return err => {
    if (/ENOENT/.test(err.message)) {
      err = new GitError({
        error: err,
        message: 'Failed to execute git (ENOENT)',
        gitErrorCode: GitErrorCodes.NotAGitRepository
      });
    }

    cb(err);
  };
}

export async function run(args: string[], options: SpawnOptions = {}): Promise<IExecutionResult<string>> {
  const res = await _exec(args, options);
  return {
    ...res,
    stdout: res.stdout.toString()
  };
}

async function exec(child: cp.ChildProcess, cancellationToken?: CancellationToken): Promise<IExecutionResult<Buffer>> {
  if (!child.stdout || !child.stderr) {
    throw new GitError({ message: 'Failed to get stdout or stderr from git process.' });
  }

  if (cancellationToken && cancellationToken.isCancellationRequested) {
    throw new CancellationError();
  }

  const disposables: IDisposable[] = [];

  const once = (ee: NodeJS.EventEmitter, name: string, fn: (...args: any[]) => void) => {
    ee.once(name, fn);
    disposables.push(toDisposable(() => ee.removeListener(name, fn)));
  };

  const on = (ee: NodeJS.EventEmitter, name: string, fn: (...args: any[]) => void) => {
    ee.on(name, fn);
    disposables.push(toDisposable(() => ee.removeListener(name, fn)));
  };

  let result = Promise.all<any>([
    new Promise<number>((c, e) => {
      once(child, 'error', cpErrorHandler(e));
      once(child, 'exit', c);
    }),
    new Promise<Buffer>(c => {
      const buffers: Buffer[] = [];
      on(child.stdout!, 'data', (b: Buffer) => buffers.push(b));
      once(child.stdout!, 'close', () => c(Buffer.concat(buffers)));
    }),
    new Promise<string>(c => {
      const buffers: Buffer[] = [];
      on(child.stderr!, 'data', (b: Buffer) => buffers.push(b));
      once(child.stderr!, 'close', () => c(Buffer.concat(buffers).toString('utf8')));
    })
  ]) as Promise<[number, Buffer, string]>;

  if (cancellationToken) {
    const cancellationPromise = new Promise<[number, Buffer, string]>((_, e) => {
      onceEvent(cancellationToken.onCancellationRequested)(() => {
        try {
          child.kill();
        } catch (err) {
          // noop
        }

        e(new CancellationError());
      });
    });

    result = Promise.race([result, cancellationPromise]);
  }

  try {
    const [exitCode, stdout, stderr] = await result;
    return { exitCode, stdout, stderr };
  } finally {
    dispose(disposables);
  }
}

async function _exec(args: string[], options: SpawnOptions = {}): Promise<IExecutionResult<string>> {

  let pathHints = Array.isArray(magitConfig.gitPath) ? magitConfig.gitPath : magitConfig.gitPath ? [magitConfig.gitPath] : [];
  if (pathHints.length !== 0) {
    pathHints = pathHints.filter(p => path.isAbsolute(p));  
  }

  const git = await findGit(pathHints, () => true);
  const child = spawn(git.path, [...GitConfigOverrideArgs, ...args], options);

  // options.onSpawn?.(child);

  if (options.input) {
    child.stdin!.end(options.input, 'utf8');
  }

  const startExec = Date.now();
  let bufferResult: IExecutionResult<Buffer>;

  try {
    bufferResult = await exec(child, options.cancellationToken);
  } catch (ex) {
    if (ex instanceof CancellationError) {
      // this.log(`> git ${args.join(' ')} [${Date.now() - startExec}ms] (cancelled)\n`);
    }

    throw ex;
  }

  if (options.log !== false) {
    // command
    // this.log(`> git ${args.join(' ')} [${Date.now() - startExec}ms]\n`);

    // stdout
    // if (bufferResult.stdout.length > 0 && args.find(a => this.commandsToLog.includes(a))) {
    //   this.log(`${bufferResult.stdout}\n`);
    // }

    // stderr
    if (bufferResult.stderr.length > 0) {
      // this.log(`${bufferResult.stderr}\n`);
    }
  }

  let encoding = options.encoding || 'utf8';
  encoding = iconv.encodingExists(encoding) ? encoding : 'utf8';

  const result: IExecutionResult<string> = {
    exitCode: bufferResult.exitCode,
    stdout: iconv.decode(bufferResult.stdout, encoding),
    stderr: bufferResult.stderr
  };

  if (bufferResult.exitCode) {
    return Promise.reject<IExecutionResult<string>>(new GitError({
      message: 'Failed to execute git',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      gitErrorCode: getGitErrorCode(result.stderr),
      gitCommand: args[0],
      gitArgs: args
    }));
  }

  return result;
}

// https://github.com/microsoft/vscode/issues/89373
// https://github.com/git-for-windows/git/issues/2478
function sanitizePath(path: string): string {
  return path.replace(/^([a-z]):\\/i, (_, letter) => `${letter.toUpperCase()}:\\`);
}

function spawn(path: string, args: string[], options: SpawnOptions = {}): cp.ChildProcess {

  if (!options) {
    options = {};
  }

  if (!options.stdio && !options.input) {
    options.stdio = ['ignore', null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
  }

  options.env = Object.assign({}, process.env, options.env || {}, {
    VSCODE_GIT_COMMAND: args[0],
    LC_ALL: 'en_US.UTF-8',
    LANG: 'en_US.UTF-8',
    GIT_PAGER: 'cat',

    // TODO: add ask pass functionality
    // GIT_ASKPASS: path.join(__dirname, 'askpass.sh'),
    // VSCODE_GIT_ASKPASS_NODE: process.execPath,
    // VSCODE_GIT_ASKPASS_MAIN: path.join(__dirname, 'askpass-main.js')
  });

  const santizedOptions = sanitizeOptions(options);

  return cp.spawn(path, args, santizedOptions);
}

function sanitizeOptions(options: SpawnOptions): cp.SpawnOptions {
  let cwd = getCwd(options);
  if (cwd) {
    cwd = sanitizePath(cwd);
  }

  return {
    ...options,
    cwd: cwd
  };
}

function getCwd(options: SpawnOptions): string | undefined {
  const cwd = options.cwd;
  if (typeof cwd === 'undefined' || typeof cwd === 'string') {
    return cwd;
  }

  if (cwd.scheme) {
    return cwd.fsPath;
  }

  return undefined;
}

function onceEvent<T>(event: Event<T>): Event<T> {
  return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => {
    const result = event(e => {
      result.dispose();
      return listener.call(thisArgs, e);
    }, null, disposables);

    return result;
  };
}

const enum GitErrorCodes {
  BadConfigFile = 'BadConfigFile',
  AuthenticationFailed = 'AuthenticationFailed',
  NoUserNameConfigured = 'NoUserNameConfigured',
  NoUserEmailConfigured = 'NoUserEmailConfigured',
  NoRemoteRepositorySpecified = 'NoRemoteRepositorySpecified',
  NotAGitRepository = 'NotAGitRepository',
  NotAtRepositoryRoot = 'NotAtRepositoryRoot',
  Conflict = 'Conflict',
  StashConflict = 'StashConflict',
  UnmergedChanges = 'UnmergedChanges',
  PushRejected = 'PushRejected',
  RemoteConnectionError = 'RemoteConnectionError',
  DirtyWorkTree = 'DirtyWorkTree',
  CantOpenResource = 'CantOpenResource',
  GitNotFound = 'GitNotFound',
  CantCreatePipe = 'CantCreatePipe',
  PermissionDenied = 'PermissionDenied',
  CantAccessRemote = 'CantAccessRemote',
  RepositoryNotFound = 'RepositoryNotFound',
  RepositoryIsLocked = 'RepositoryIsLocked',
  BranchNotFullyMerged = 'BranchNotFullyMerged',
  NoRemoteReference = 'NoRemoteReference',
  InvalidBranchName = 'InvalidBranchName',
  BranchAlreadyExists = 'BranchAlreadyExists',
  NoLocalChanges = 'NoLocalChanges',
  NoStashFound = 'NoStashFound',
  LocalChangesOverwritten = 'LocalChangesOverwritten',
  NoUpstreamBranch = 'NoUpstreamBranch',
  IsInSubmodule = 'IsInSubmodule',
  WrongCase = 'WrongCase',
  CantLockRef = 'CantLockRef',
  CantRebaseMultipleBranches = 'CantRebaseMultipleBranches',
  PatchDoesNotApply = 'PatchDoesNotApply',
  NoPathFound = 'NoPathFound',
  UnknownPath = 'UnknownPath',
  EmptyCommitMessage = 'EmptyCommitMessage',
  BranchFastForwardRejected = 'BranchFastForwardRejected',
  TagConflict = 'TagConflict'
}

function getGitErrorCode(stderr: string): string | undefined {
  if (/Another git process seems to be running in this repository|If no other git process is currently running/.test(stderr)) {
    return GitErrorCodes.RepositoryIsLocked;
  } else if (/Authentication failed/i.test(stderr)) {
    return GitErrorCodes.AuthenticationFailed;
  } else if (/Not a git repository/i.test(stderr)) {
    return GitErrorCodes.NotAGitRepository;
  } else if (/bad config file/.test(stderr)) {
    return GitErrorCodes.BadConfigFile;
  } else if (/cannot make pipe for command substitution|cannot create standard input pipe/.test(stderr)) {
    return GitErrorCodes.CantCreatePipe;
  } else if (/Repository not found/.test(stderr)) {
    return GitErrorCodes.RepositoryNotFound;
  } else if (/unable to access/.test(stderr)) {
    return GitErrorCodes.CantAccessRemote;
  } else if (/branch '.+' is not fully merged/.test(stderr)) {
    return GitErrorCodes.BranchNotFullyMerged;
  } else if (/Couldn't find remote ref/.test(stderr)) {
    return GitErrorCodes.NoRemoteReference;
  } else if (/A branch named '.+' already exists/.test(stderr)) {
    return GitErrorCodes.BranchAlreadyExists;
  } else if (/'.+' is not a valid branch name/.test(stderr)) {
    return GitErrorCodes.InvalidBranchName;
  } else if (/Please,? commit your changes or stash them/.test(stderr)) {
    return GitErrorCodes.DirtyWorkTree;
  }

  return undefined;
}
