import { window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState, Switch, MenuItem } from '../menu/menu';
import { gitRun } from '../utils/gitRawRunner';
import { PickMenuItem, PickMenuUtil } from '../menu/pickMenu';

export async function fetching(repository: MagitRepository): Promise<any> {

  const fetchingMenuItems: MenuItem[] = [];

  if (repository.HEAD?.pushRemote) {
    const pushRemote = repository.HEAD?.pushRemote;
    fetchingMenuItems.push({ label: 'p', description: pushRemote.remote, icon: 'repo', action: fetchFromPushRemote });
  }

  if (repository.HEAD?.upstream) {
    const upstream = repository.HEAD?.upstream;
    fetchingMenuItems.push({ label: 'u', description: upstream.remote, icon: 'repo-pull', action: fetchFromUpstream });
  }

  fetchingMenuItems.push({ label: 'e', description: 'elsewhere', icon: 'repo-clone', action: fetchFromElsewhere });

  fetchingMenuItems.push({ label: 'a', description: 'all remotes', icon: 'list-flat', action: fetchAll });

  fetchingMenuItems.push({ label: 'o', description: 'another branch', icon: 'git-branch', action: fetchAnotherBranch });

  if (repository.submodules.length) {
    fetchingMenuItems.push({ label: 's', description: 'submodules', icon: 'file-submodule', action: fetchSubmodules });
  }

  const switches: Switch[] = [
    { key: '-p', name: '--prune', description: 'Prune deleted branches', icon: 'trash' }
  ];

  return MenuUtil.showMenu({ title: 'Fetching', commands: fetchingMenuItems }, { repository, switches });
}

async function fetchFromPushRemote({ repository, switches }: MenuState) {
  if (repository.HEAD?.pushRemote) {
    const args = ['fetch', ...MenuUtil.switchesToArgs(switches), repository.HEAD.pushRemote.remote];
    return gitRun(repository.gitRepository, args);
  }
}

async function fetchFromUpstream({ repository, switches }: MenuState) {

  if (repository.HEAD?.upstreamRemote) {
    const args = ['fetch', ...MenuUtil.switchesToArgs(switches), repository.HEAD.upstreamRemote.remote];
    return gitRun(repository.gitRepository, args);
  }
}

async function fetchFromElsewhere({ repository, switches }: MenuState) {

  const remotes: PickMenuItem<string>[] = repository.remotes
    .map(r => ({ label: r.name, description: r.pushUrl, meta: r.name }));

  const chosenRemote = await PickMenuUtil.showMenu(remotes);

  if (chosenRemote) {
    const args = ['fetch', ...MenuUtil.switchesToArgs(switches), chosenRemote];
    return gitRun(repository.gitRepository, args);
  }
}

async function fetchAll({ repository, switches }: MenuState) {
  const args = ['fetch', ...MenuUtil.switchesToArgs(switches), '--all'];
  return gitRun(repository.gitRepository, args);
}

async function fetchAnotherBranch({ repository, switches }: MenuState) {
  const remote = await window.showInputBox({ prompt: 'Fetch from remote or url' });
  if (remote) {
    const branch = await window.showInputBox({ prompt: 'Fetch branch' });
    if (branch) {
      const args = ['fetch', ...MenuUtil.switchesToArgs(switches), remote, `refs/heads/${branch}`];
      return gitRun(repository.gitRepository, args);
    }
  }
}

export async function fetchSubmodules({ repository, switches }: MenuState) {

  const args = ['fetch', '--verbose', '--recurse-submodules', ...MenuUtil.switchesToArgs(switches)];
  return gitRun(repository.gitRepository, args);
}
