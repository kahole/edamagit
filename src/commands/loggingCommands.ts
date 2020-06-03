import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { window, workspace } from 'vscode';
import LogView from '../views/logView';
import { views } from '../extension';
import MagitUtils from '../utils/magitUtils';
import { gitRun } from '../utils/gitRawRunner';
import { Commit } from '../typings/git';

const loggingMenu = {
  title: 'Logging',
  commands: [
    { label: 'c', description: 'Log current', action: logHead },
    { label: 'h', description: 'Log HEAD', action: logHead },
  ]
};

export async function logging(repository: MagitRepository) {
  return MenuUtil.showMenu(loggingMenu, { repository });
}

async function logHead({ repository }: MenuState) {

  if (repository.magitState?.HEAD) {

    // const log = await repository.log({ maxEntries: 100 });
    const output = await gitRun(repository, ['log', '--format=%H%d [%an] [%at]%s', '--graph', '-n100']);
    const log = parseLog(output.stdout);

    const uri = LogView.encodeLocation(repository);
    views.set(uri.toString(), new LogView(uri, { commits: log, refName: repository.magitState?.HEAD.name! }));
    workspace.openTextDocument(uri)
      .then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
  }
}

function parseLog(stdout: string) {
  const commits: LogCommit[] = [];
  // http://www.unicode.org/reports/tr18/#Line_Boundaries
  // const lines = stdout.split(/(?:\u{D A}|(?!\u{D A})[\u{A}-\u{D}\u{85}\u{2028}\u{2029}]/);
  const lines = stdout.match(/[^\r\n]+/g);//.split(/\r?\n/);
  const lineRe = new RegExp(
    '([/|\\-_* .o]+)' + // Graph
    '([a-f0-9]{40})' + // Sha
    '( \\(([^()]+)\\))?' + // Refs
    '( \\[([^\\[\\]]+)\\])' + // Author
    '( \\[([^\\[\\]]+)\\])' + // Time
    '(.*)', // Message
    'g');
  lines?.forEach(l => {
    if (l.match(/^[/|\\-_* .o]+$/g)) { //graph only
      // Add to previous commits
      if (commits.length > 0) {
        commits[commits.length - 1].graph.push(l);
      }
    } else {
      // ES 2020 string to match all
      // Convert to iterator to array with spread
      const t = [...l.matchAll(lineRe)];
      if (t && t.length > 0) {
        commits.push(new LogCommit({
          graph: [t[0][1]],
          hash: t[0][2],
          refs: t[0][4],
          author: t[0][6],
          time: new Date(Number(t[0][8]) * 1000),
          message: t[0][9]
        }));
      }
      console.log(t);
    }
  });
  return commits;
}
interface ILogCommit {
  graph: string[]
  hash: string;
  refs: string | undefined;
  author: string;
  time: Date;
  message: string;
}

export class LogCommit implements Commit, ILogCommit {
  graph: string[]
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