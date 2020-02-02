import { commands, window } from 'vscode';
import { MenuItem } from '../menu/menuItem';
import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { gitRun } from '../utils/gitRawRunner';
import { QuickMenuUtil, QuickItem } from '../menu/quickMenu';

export async function fetching(repository: MagitRepository): Promise<any> {

  const fetchingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    fetchingMenuItems.push({ label: 'p', description: `${pushRemote.remote}/${pushRemote.name}`, action: fetchFromPushRemote });
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    fetchingMenuItems.push({ label: 'u', description: `${upstream.remote}/${upstream.name}`, action: fetchFromUpstream });
  }

  fetchingMenuItems.push({ label: 'e', description: 'elsewhere', action: fetchFromElsewhere });

  fetchingMenuItems.push({ label: 'a', description: 'all remotes', action: fetchAll });

  fetchingMenuItems.push({ label: 'o', description: 'another branch', action: fetchAnotherBranch });

  return MenuUtil.showMenu({ title: 'Fetching', commands: fetchingMenuItems }, { repository });
}

// TODO: fetching: some work remains for MVP

async function fetchFromPushRemote() {

}

async function fetchFromUpstream() {
  return commands.executeCommand('git.fetch');
}

async function fetchFromElsewhere({ repository }: MenuState) {

  const refs: QuickItem<string>[] = repository.state.refs
    .map(r => ({ label: r.name!, meta: 'blabla' }));

  const chosenRemote = await QuickMenuUtil.showMenu(refs);

  if (chosenRemote) {
    const args = ['fetch', chosenRemote];
    return gitRun(repository, args);
  }
}

async function fetchAll() {
  return commands.executeCommand('git.fetchAll');
}

async function fetchAnotherBranch({ repository }: MenuState) {
  const remote = await window.showInputBox({ prompt: 'Fetch from remote or url' });
  if (remote) {
    const branch = await window.showInputBox({ prompt: 'Fetch branch' });
    if (branch) {
      const args = ['fetch', remote, `refs/heads/${branch}`];
      return gitRun(repository, args);

    }
  }
}