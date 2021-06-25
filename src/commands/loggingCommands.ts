import { window } from 'vscode';
import { StatusMessageDisplayTimeout } from '../common/constants';
import { MenuState, MenuUtil, Switch, Option } from '../menu/menu';
import { MagitBranch } from '../models/magitBranch';
import { MagitLogEntry } from '../models/magitLogCommit';
import { MagitRepository } from '../models/magitRepository';
import { gitRun, LogLevel } from '../utils/gitRawRunner';
import ViewUtils from '../utils/viewUtils';
import LogView from '../views/logView';

const loggingMenu = {
  title: 'Logging',
  commands: [
    { label: 'l', description: 'Log current', icon: 'git-commit', action: wrap(logCurrent) },
    { label: 'o', description: 'Log other', icon: 'git-branch', action: wrap(logOther) },
    { label: 'h', description: 'Log HEAD', icon: 'git-compare', action: wrap(logHead) },
    { label: 'L', description: 'Log local branches', icon: 'device-desktop', action: wrap(logLocalBranches) },
    { label: 'b', description: 'Log branches', icon: 'repo-forked', action: wrap(logBranches) },
    { label: 'a', description: 'Log references', icon: 'references', action: wrap(logReferences) },
  ]
};

const switches: Switch[] = [
  { key: '-D', name: '--simplify-by-decoration', description: 'Simplify by decoration' },
  { key: '-g', name: '--graph', description: 'Show graph', activated: true },
  { key: '-d', name: '--decorate', description: 'Show refnames', activated: true }
];

const options: Option[] = [
  { key: '=n', name: '-n', description: 'Limit number of commits', value: '256', activated: true },
];

export async function logging(repository: MagitRepository) {
  return MenuUtil.showMenu(loggingMenu, { repository, switches, options });
}

// A function wrapper to avoid duplicate checking code
function wrap(action: (repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) => Promise<any>) {
  return async ({ repository, switches, options }: MenuState) => {
    if (repository.HEAD && switches && options) {
      return action(repository, repository.HEAD, switches, options);
    }
  };
}

async function logCurrent(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  let revs = head.name ? [head.name] : await getRevs(repository);
  if (revs) {
    await log(repository, args, revs);
  }
}

async function logOther(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  const revs = await getRevs(repository);
  if (revs) {
    await log(repository, args, revs);
  }
}

async function logHead(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  await log(repository, args, ['HEAD']);
}

async function logLocalBranches(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  const revs = [head.name ?? 'HEAD', '--branches'];
  await log(repository, args, revs);
}

async function logBranches(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  const revs = [head.name ?? 'HEAD', '--branches', '--remotes'];
  await log(repository, args, revs);
}

async function logReferences(repository: MagitRepository, head: MagitBranch, switches: Switch[], options: Option[]) {
  const args = createLogArgs(switches, options);
  const revs = [head.name ?? 'HEAD', '--all'];
  await log(repository, args, revs);
}

async function log(repository: MagitRepository, args: string[], revs: string[]) {
  const output = await gitRun(repository.gitRepository, args.concat(revs), {}, LogLevel.Error);
  const logEntries = parseLog(output.stdout);
  const revName = revs.join(' ');
  const uri = LogView.encodeLocation(repository);
  return ViewUtils.showView(uri, new LogView(uri, { entries: logEntries, revName }));
}

async function getRevs(repository: MagitRepository) {
  // TODO: Auto complete branches and tags
  const placeHolder = repository.HEAD?.name;
  const input = await window.showInputBox({ prompt: 'Log rev,s:', placeHolder });
  if (input && input.length > 0) {
    // split space or commas
    return input.split(/[, ]/g).filter(r => r.length > 0);
  } else if (placeHolder) {
    // if user didn't enter anything, but placeholder exist
    return [placeHolder];
  }

  window.setStatusBarMessage('Nothing selected', StatusMessageDisplayTimeout);
}

function createLogArgs(switches: Switch[], options: Option[]) {
  const switchMap = switches.reduce((prev, current) => {
    prev[current.key] = current;
    return prev;
  }, {} as Record<string, Switch>);

  const decorateFormat = switchMap['-d'].activated ? '%d' : '';
  const formatArg = `--format=%H${decorateFormat} [%an] [%at]%s`;
  const args = ['log', formatArg, '--use-mailmap', ...MenuUtil.optionsToArgs(options)];
  if (switchMap['-D'].activated) {
    args.push(switchMap['-D'].name);
  }
  if (switchMap['-g'].activated) {
    args.push(switchMap['-g'].name);
  }
  return args;
}

function parseLog(stdout: string): MagitLogEntry[] {
  const commits: MagitLogEntry[] = [];
  // Split stdout lines
  const lines = stdout.match(/[^\r\n]+/g);
  // regex to parse line
  const lineRe = new RegExp(
    '^([/|\\-_* .o]+)?' + // Graph
    '([a-f0-9]{40})' + // Sha
    '( \\(([^()]+)\\))?' + // Refs
    '( \\[([^\\[\\]]+)\\])' + // Author
    '( \\[([^\\[\\]]+)\\])' + // Time
    '(.*)$', // Message
    'g');
  // regex to match graph only line
  const graphRe = /^[/|\\-_* .o]+$/g;

  lines?.forEach(l => {
    if (l.match(graphRe)) { //graph only
      // Add to previous commits
      commits[commits.length - 1]?.graph?.push(l);
    } else {
      const matches = l.matchAll(lineRe).next().value;
      if (matches && matches.length > 0) {
        const graph = matches[1]; // undefined if graph doesn't exist
        const log = {
          graph: graph ? [graph] : undefined,
          refs: (matches[4] ?? '').split(', ').filter((m: string) => m),
          author: matches[6],
          time: new Date(Number(matches[8]) * 1000), // convert seconds to milliseconds
          commit: {
            hash: matches[2],
            message: matches[9],
            parents: [],
            authorEmail: undefined
          }
        };
        commits.push(log);
      }
    }
  });
  return commits;
}
