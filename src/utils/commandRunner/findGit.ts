import * as cp from 'child_process';
import { cpErrorHandler } from './command';
import path = require('path');
import * as which from 'which';
import { magitConfig } from '../../extension';

export interface IGit {
  path: string;
  version: string;
}

function parseVersion(raw: string): string {
  return raw.replace(/^git version /, '');
}

function findSpecificGit(path: string, onValidate: (path: string) => boolean): Promise<IGit> {
  return new Promise<IGit>((c, e) => {
    if (!onValidate(path)) {
      return e('git not found');
    }

    const buffers: Buffer[] = [];
    const child = cp.spawn(path, ['--version']);
    child.stdout.on('data', (b: Buffer) => buffers.push(b));
    child.on('error', cpErrorHandler(e));
    child.on('exit', code => code ? e(new Error('Not found')) : c({ path, version: parseVersion(Buffer.concat(buffers).toString('utf8').trim()) }));
  });
}

function findGitDarwin(onValidate: (path: string) => boolean): Promise<IGit> {
  return new Promise<IGit>((c, e) => {
    cp.exec('which git', (err, gitPathBuffer) => {
      if (err) {
        return e('git not found');
      }

      const path = gitPathBuffer.toString().trim();

      function getVersion(path: string) {
        if (!onValidate(path)) {
          return e('git not found');
        }

        // make sure git executes
        cp.exec('git --version', (err, stdout) => {

          if (err) {
            return e('git not found');
          }

          return c({ path, version: parseVersion(stdout.trim()) });
        });
      }

      if (path !== '/usr/bin/git') {
        return getVersion(path);
      }

      // must check if XCode is installed
      cp.exec('xcode-select -p', (err: any) => {
        if (err && err.code === 2) {
          // git is not installed, and launching /usr/bin/git
          // will prompt the user to install it

          return e('git not found');
        }

        getVersion(path);
      });
    });
  });
}

function findSystemGitWin32(base: string, onValidate: (path: string) => boolean): Promise<IGit> {
  if (!base) {
    return Promise.reject<IGit>('Not found');
  }

  return findSpecificGit(path.join(base, 'Git', 'cmd', 'git.exe'), onValidate);
}

function findGitWin32InPath(onValidate: (path: string) => boolean): Promise<IGit> {
  const whichPromise = new Promise<string>((c, e) => which('git.exe', (err, path) => err ? e(err) : (path ? c(path) : e(new Error('not found')))));
  return whichPromise.then(path => findSpecificGit(path, onValidate));
}

function findGitWin32(onValidate: (path: string) => boolean): Promise<IGit> {
  return findSystemGitWin32(process.env['ProgramW6432'] as string, onValidate)
  .then(undefined, () => findSystemGitWin32(magitConfig.winGitPath || '', onValidate))
    .then(undefined, () => findSystemGitWin32(process.env['ProgramFiles(x86)'] as string, onValidate))
    .then(undefined, () => findSystemGitWin32(process.env['ProgramFiles'] as string, onValidate))
    .then(undefined, () => findSystemGitWin32(path.join(process.env['LocalAppData'] as string, 'Programs'), onValidate))
    .then(undefined, () => findGitWin32InPath(onValidate));
}

export async function findGit(hints: string[], onValidate: (path: string) => boolean): Promise<IGit> {
  for (const hint of hints) {
    try {
      return await findSpecificGit(hint, onValidate);
    } catch {
      // noop
    }
  }

  try {
    switch (process.platform) {
      case 'darwin': return await findGitDarwin(onValidate);
      case 'win32': return await findGitWin32(onValidate);
      default: return await findSpecificGit('git', onValidate);
    }
  } catch {
    // noop
  }

  throw new Error('Git installation not found.');
}
