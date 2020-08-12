import { window, workspace } from 'vscode';
import { StatusMessageDisplayTimeout } from '../common/constants';
import { views } from '../extension';
import { MenuState, MenuUtil, Switch } from '../menu/menu';
import { MagitBranch } from '../models/magitBranch';
import { MagitLogEntry } from '../models/magitLogCommit';
import { MagitRepository } from '../models/magitRepository';
import { gitRun, LogLevel } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import LogView from '../views/logView';

const loggingMenu = {
  title: 'Logging',
  commands: [
    { label: 'l', description: 'Log current', action: wrap(logCurrent) },
    { label: 'o', description: 'Log other', action: wrap(logOther) },
    { label: 'h', description: 'Log HEAD', action: wrap(logHead) },
    { label: 'L', description: 'Log local branches', action: wrap(logLocalBranches) },
    { label: 'b', description: 'Log branches', action: wrap(logBranches) },
    { label: 'a', description: 'Log references', action: wrap(logReferences) },
  ]
};

const switches: Switch[] = [
  { shortName: '-D', longName: '--simplify-by-decoration', description: 'Simplify by decoration' },
  { shortName: '-g', longName: '--graph', description: 'Show graph', activated: true },
  { shortName: '-d', longName: '--decorate', description: 'Show refnames', activated: true }
];

export async function logging(repository: MagitRepository) {
  return MenuUtil.showMenu(loggingMenu, { repository, switches });
}

// A function wrapper to avoid duplicate checking code
function wrap(action: (repository: MagitRepository, head: MagitBranch, switches: Switch[]) => Thenable<void>) {
  return ({ repository, switches }: MenuState) => {
    if (repository.magitState?.HEAD && switches) {
      return action(repository, repository.magitState.HEAD, switches);
    }
  };
}

async function logCurrent(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  let revs = head.name ? [head.name] : await getRevs(repository);
  if (revs) {
    await log(repository, args, revs);
  }
}

async function logOther(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  const revs = await getRevs(repository);
  if (revs) {
    await log(repository, args, revs);
  }
}

async function logHead(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  await log(repository, args, ['HEAD']);
}

async function logLocalBranches(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  const revs = [head.name ?? 'HEAD', '--branches'];
  await log(repository, args, revs);
}

async function logBranches(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  const revs = [head.name ?? 'HEAD', '--branches', '--remotes'];
  await log(repository, args, revs);
}

async function logReferences(repository: MagitRepository, head: MagitBranch, switches: Switch[]) {
  const args = createLogArgs(switches);
  const revs = [head.name ?? 'HEAD', '--all'];
  await log(repository, args, revs);
}

async function log(repository: MagitRepository, args: string[], revs: string[]) {
  const output = await gitRun(repository, args.concat(revs), {}, LogLevel.Error);
  const logEntries = parseLog(output.stdout);
  const revName = revs.join(' ');
  const uri = LogView.encodeLocation(repository);
  views.set(uri.toString(), new LogView(uri, { entries: logEntries, revName }));
  workspace.openTextDocument(uri)
    .then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.showDocumentColumn(), preserveFocus: false, preview: false }));
}

async function getRevs(repository: MagitRepository) {
  // TODO: Auto complete branches and tags
  const placeHolder = repository.magitState?.HEAD?.name;
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

function createLogArgs(switches: Switch[]) {
  const switchMap = switches.reduce((prev, current) => {
    prev[current.shortName] = current;
    return prev;
  }, {} as Record<string, Switch>);

  const decorateFormat = switchMap['-d'].activated ? '%d' : '';
  const formatArg = `--format=%H${decorateFormat} [%an] [%at]%s`;
  const args = ['log', formatArg, '-n100', '--use-mailmap'];
  if (switchMap['-D'].activated) {
    args.push(switchMap['-D'].longName);
  }
  if (switchMap['-g'].activated) {
    args.push(switchMap['-g'].longName);
  }
  return args;
}

function parseLog(stdout: string) {
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