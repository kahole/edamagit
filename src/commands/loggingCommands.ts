import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState, Switch } from '../menu/menu';
import { window, workspace } from 'vscode';
import LogView from '../views/logView';
import { views } from '../extension';
import MagitUtils from '../utils/magitUtils';
import { gitRun } from '../utils/gitRawRunner';
import { Commit, RefType } from '../typings/git';
import { StatusMessageDisplayTimeout } from '../common/constants';
import { MagitLog } from '../models/magitLog';

const loggingMenu = {
  title: 'Logging',
  commands: [
    { label: 'l', description: 'Log current', action: logCurrent },
    { label: 'o', description: 'Log other', action: logOther },
    { label: 'h', description: 'Log HEAD', action: logHead },
    { label: 'L', description: 'Log local branches', action: logLocalBranches },
    { label: 'b', description: 'Log branches', action: logBranches },
    { label: 'a', description: 'Log references', action: logReferences },
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

async function logCurrent({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    let revs;
    if (repository.magitState?.HEAD.name) {
      revs = [repository.magitState?.HEAD.name];
    } else {
      revs = await getRevs(repository);
    }

    if (revs) {
      await log(repository, args, revs);
    }
  }
}

async function logOther({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    const revs = await getRevs(repository);
    if (revs) {
      await log(repository, args, revs);
    }
  }
}

async function logHead({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    await log(repository, args, ['HEAD']);
  }
}

async function logLocalBranches({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    let revs;
    if (repository.magitState?.HEAD.name) {
      revs = [repository.magitState?.HEAD.name];
    } else {
      revs = ['HEAD'];
    }

    if (revs) {
      await log(repository, args, revs.concat(['--branches']));
    }
  }
}

async function logBranches({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    let revs;
    if (repository.magitState?.HEAD.name) {
      revs = [repository.magitState?.HEAD.name];
    } else {
      revs = ['HEAD'];
    }

    await log(repository, args, revs.concat(['--branches', '--remotes']));
  }
}

async function logReferences({ repository, switches }: MenuState) {
  if (repository.magitState?.HEAD && switches) {
    const args = createLogArgs(switches);
    let revs;
    if (repository.magitState?.HEAD.name) {
      revs = [repository.magitState?.HEAD.name];
    } else {
      revs = ['HEAD'];
    }

    await log(repository, args, revs.concat(['--all']));
  }
}

async function log(repository: MagitRepository, args: string[], revs: string[]) {
  const output = await gitRun(repository, args.concat(revs));
  const commits = parseLog(output.stdout);
  const revName = revs.join(' ');
  const uri = LogView.encodeLocation(repository);
  views.set(uri.toString(), new LogView(uri, { commits, revName }));
  workspace.openTextDocument(uri)
    .then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
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
  const args = ['log', formatArg, '-n100'];
  if (switchMap['-D'].activated) {
    args.push(switchMap['-D'].longName);
  }
  if (switchMap['-g'].activated) {
    args.push(switchMap['-g'].longName);
  }
  return args;
}

function parseLog(stdout: string) {
  const commits: LogCommit[] = [];
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
        commits.push(new LogCommit({
          graph: graph ? [graph] : undefined,
          hash: matches[2],
          refs: matches[4],
          author: matches[6],
          time: new Date(Number(matches[8]) * 1000), // convert seconds to milliseconds
          message: matches[9]
        }));
      }
    }
  });
  return commits;
}
interface ILogCommit {
  graph: string[] | undefined;
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;
}

export class LogCommit implements Commit, ILogCommit {
  graph: string[] | undefined;
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;

  constructor(commit: ILogCommit) {
    this.graph = commit.graph;
    this.hash = commit.hash;
    this.refs = commit.refs;
    this.author = commit.author;
    this.time = commit.time;
    this.message = commit.message;
  }

  get parents(): string[] {
    throw Error('Not Implemented for LogCommit');
  }
  get authorEmail(): string | undefined {
    throw Error('Not Implemented for LogCommit');
  }
}