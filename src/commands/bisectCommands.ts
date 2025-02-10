import { commands } from 'vscode';
import { MenuState, MenuUtil } from '../menu/menu';
import { MagitBisectState } from '../models/magitBisectState';
import { MagitLogEntry } from '../models/magitLogCommit';
import { MagitRepository } from '../models/magitRepository';
import { Ref, RefType, Repository } from '../typings/git';
import { gitRun, LogLevel } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import ViewUtils from '../utils/viewUtils';
import LogView from '../views/logView';

const bisectingCommands = [
  { label: 's', description: 'Start', action: startBisecting },
  { label: 'g', description: 'Mark as good', action: markAsGood },
  { label: 'b', description: 'Mark as bad', action: markAsBad },
  { label: 'r', description: 'Reset', action: resetBisect },
];

export async function bisecting(repository: MagitRepository) {
  const commands = [...bisectingCommands];
  if (repository.bisectState?.bisecting) {
    commands.shift();
  } else {
    commands.pop();
  }
  const menu = {
    title: 'Bisecting',
    commands
  };

  return MenuUtil.showMenu(menu, { repository });
}

async function startBisecting({ repository }: MenuState) {
  await gitRun(repository.gitRepository, ['bisect', 'start']);
}

async function markAsGood({ repository }: MenuState) {
  const ref = await MagitUtils.chooseRef(repository, 'Mark as good');
  if (!ref) {
    return;
  }
  await gitRun(repository.gitRepository, ['bisect', 'good', ref]);
}

async function markAsBad({ repository }: MenuState) {
  const ref = await MagitUtils.chooseRef(repository, 'Mark as bad');
  if (!ref) {
    return;
  }
  await gitRun(repository.gitRepository, ['bisect', 'bad', ref]);
}

async function resetBisect({ repository }: MenuState) {
  await gitRun(repository.gitRepository, ['bisect', 'reset']);
}

function matchWithFallback(log: string, primaryPattern: RegExp, fallbackPattern: RegExp) {
  let match = log.match(primaryPattern);
  if (!match) {
    match = log.match(fallbackPattern);
  }
  return match ? match[1] : undefined;
}

export async function bisectingStatus(repository: Repository): Promise<MagitBisectState> {
  try {
    const output = await gitRun(repository, ['bisect', 'log'], undefined, LogLevel.None, false);
    const bisectLog = output.stdout.split('\n').reverse().join('\n');

    const goodPattern = /good: \[([a-f0-9]{40})\]/;
    const goodFallbackPattern = /git bisect good ([a-f0-9]{40})/;

    const badPattern = /bad: \[([a-f0-9]{40})\]/;
    const badFallbackPattern = /git bisect bad ([a-f0-9]{40})/;

    const goodCommit = matchWithFallback(bisectLog, goodPattern, goodFallbackPattern);
    const badCommit = matchWithFallback(bisectLog, badPattern, badFallbackPattern);

    return {
      bisecting: true,
      good: goodCommit,
      bad: badCommit
    };
  } catch (err) {
    console.log(err);
    return {
      bisecting: false,
    };
  }
}

export function addBisectRefsToLogEntry(magitState: MagitRepository) {
  const { bisectState } = magitState;
  if (!bisectState || !bisectState.bisecting) {
    return (entry: MagitLogEntry) => entry;
  }
  return (entry: MagitLogEntry) => {
    const refs = [];
    if (entry.commit.hash === magitState.HEAD?.commit) {
      refs.push('bisect-current');
    }
    if (entry.commit.hash === bisectState.good) {
      refs.push('bisect-good');
    }
    if (entry.commit.hash === bisectState.bad) {
      refs.push('bisect-bad');
    }
    return {
      ...entry,
      refs: [...entry.refs, ...refs]
    };
  };
}

export function getBisectRefs(magitState: MagitRepository) {
  const refs = [];
  const { bisectState } = magitState;
  if (bisectState && bisectState.bisecting) {
    refs.push({
      name: '(current)',
      type: RefType.Tag,
      commit: magitState.HEAD?.commit
    });
    if (bisectState.good) {
      refs.push({
        name: '(good)',
        type: RefType.Tag,
        commit: bisectState.good
      });
    }
    if (bisectState.bad) {
      refs.push({
        name: '(bad)',
        type: RefType.Tag,
        commit: bisectState.bad
      });
    }
  }
  return refs;
}
