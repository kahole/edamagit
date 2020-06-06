import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState, Switch } from '../menu/menu';
import { window, workspace } from 'vscode';
import LogView from '../views/logView';
import { views } from '../extension';
import MagitUtils from '../utils/magitUtils';
import { gitRun } from '../utils/gitRawRunner';
import { Commit } from '../typings/git';
import { create } from 'domain';

const loggingMenu = {
  title: 'Logging',
  commands: [
    { label: 'l', description: 'Log current', action: logHead },
    { label: 'h', description: 'Log HEAD', action: logHead },
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

async function logHead({ repository, switches }: MenuState) {

  if (repository.magitState?.HEAD) {

    // const log = await repository.log({ maxEntries: 100 });
    // const output = await gitRun(repository, ['log', '--format=%H%d [%an] [%at]%s', '--graph', '-n100']);
    const output = await gitRun(repository, createLogArgs(switches!));
    const log = parseLog(output.stdout);

    const uri = LogView.encodeLocation(repository);
    views.set(uri.toString(), new LogView(uri, { commits: log, refName: repository.magitState?.HEAD.name! }));
    workspace.openTextDocument(uri)
      .then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
  }
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
  // http://www.unicode.org/reports/tr18/#Line_Boundaries
  // const lines = stdout.split(/(?:\u{D A}|(?!\u{D A})[\u{A}-\u{D}\u{85}\u{2028}\u{2029}]/);
  const lines = stdout.match(/[^\r\n]+/g);//.split(/\r?\n/);
  const lineRe = new RegExp(
    '^([/|\\-_* .o]+)?' + // Graph
    '([a-f0-9]{40})' + // Sha
    '( \\(([^()]+)\\))?' + // Refs
    '( \\[([^\\[\\]]+)\\])' + // Author
    '( \\[([^\\[\\]]+)\\])' + // Time
    '(.*)$', // Message
    'g');
  lines?.forEach(l => {
    if (l.match(/^[/|\\-_* .o]+$/g)) { //graph only
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
          time: new Date(Number(matches[8]) * 1000),
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
    throw Error('Not Implement for LogCommit');
  }
  get authorEmail(): string | undefined {
    return undefined;
  }
}