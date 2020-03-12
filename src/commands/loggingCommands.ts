import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { window, workspace } from 'vscode';
import LogView from '../views/logView';
import { views } from '../extension';
import MagitUtils from '../utils/magitUtils';

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

    const log = await repository.log({ maxEntries: 100 });

    const uri = LogView.encodeLocation(repository);
    views.set(uri.toString(), new LogView(uri, { commits: log, refName: repository.magitState?.HEAD.name! }));
    workspace.openTextDocument(uri)
      .then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
  }
}