import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { gitRun } from '../utils/gitRawRunner';
import { window } from 'vscode';
import * as Fetching from './fetchingCommands';
import SubmoduleListView from '../views/submoduleListView';
import ViewUtils from '../utils/viewUtils';

const submodulesMenu = {
  title: 'Submodules',
  commands: [
    { label: 'a', description: 'Add', icon: 'add', action: add },
    { label: 'r', description: 'Register', icon: 'list-flat', action: init },
    { label: 'p', description: 'Populate', icon: 'file-submodule', action: populate },
    { label: 'u', description: 'Update', icon: 'refresh', action: update },
    { label: 's', description: 'Synchronize', icon: 'link', action: sync },
    { label: 'd', description: 'Unpopulate', icon: 'trash', action: unpopulate },
    { label: 'k', description: 'Remove', icon: 'remove', action: remove },
    { label: 'l', description: 'List all modules', icon: 'list-flat', action: listAll },
    { label: 'f', description: 'Fetch all modules', icon: 'repo-pull', action: fetchAll },
  ]
};

export async function submodules(repository: MagitRepository) {

  const switches = [
    // FIXME icons?
    { key: '-f', name: '--force', description: 'Force' },
    { key: '-r', name: '--recursive', description: 'Recursive' },
    { key: '-N', name: '--no-fetch', description: 'Do not fetch' },
    { key: '-C', name: '--checkout', description: 'Checkout tip' },
    { key: '-R', name: '--rebase', description: 'Rebase onto tip' },
    { key: '-M', name: '--merge', description: 'Merge tip' },
    { key: '-U', name: '--remote', description: 'Use upstream tip' }
  ];

  return MenuUtil.showMenu(submodulesMenu, { repository, switches });
}

async function add({ repository, switches }: MenuState) {

  const submoduleRemote = await window.showInputBox({ prompt: `Add submodule (remote url)` });

  if (submoduleRemote) {

    const args = ['submodule', 'add', ...MenuUtil.switchesToArgs(switches), submoduleRemote];
    return await gitRun(repository.gitRepository, args);
  }
}

async function init({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Populate module');

  if (submodule) {
    const args = ['submodule', 'init', ...MenuUtil.switchesToArgs(switches), '--', submodule];
    return await gitRun(repository.gitRepository, args);
  }
}

async function populate({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Populate module');

  if (submodule) {
    const args = ['submodule', 'update', '--init', ...MenuUtil.switchesToArgs(switches), '--', submodule];
    return await gitRun(repository.gitRepository, args);
  }
}

async function update({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Update module');

  if (submodule) {
    const args = ['submodule', 'update', ...MenuUtil.switchesToArgs(switches), '--', submodule];
    return await gitRun(repository.gitRepository, args);
  }
}

async function sync({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Synchronize module');

  if (submodule) {
    const args = ['submodule', 'sync', ...MenuUtil.switchesToArgs(switches), '--', submodule];
    return await gitRun(repository.gitRepository, args);
  }
}

async function unpopulate({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Unpopulate module');

  if (submodule) {
    const args = ['submodule', 'deinit', ...MenuUtil.switchesToArgs(switches), '--', submodule];
    return await gitRun(repository.gitRepository, args);
  }
}

async function remove({ repository, switches }: MenuState) {

  const submodule = await pickSubmodule(repository, 'Remove module');

  if (submodule) {

    const absorbArgs = ['submodule', 'absorbgitdirs', '--', submodule];
    const deinitArgs = ['submodule', 'deinit', '--', submodule];
    const removeArgs = ['rm', '--', submodule];

    await gitRun(repository.gitRepository, absorbArgs);
    await gitRun(repository.gitRepository, deinitArgs);
    return await gitRun(repository.gitRepository, removeArgs);
  }
}

async function listAll({ repository, switches }: MenuState) {

  const uri = SubmoduleListView.encodeLocation(repository);

  let submoduleListView = ViewUtils.createOrUpdateView(repository, uri, () => new SubmoduleListView(uri, repository));

  return ViewUtils.showView(uri, submoduleListView);
}

function fetchAll({ repository, switches }: MenuState) {
  return Fetching.fetchSubmodules({ repository, switches });
}

async function pickSubmodule(repository: MagitRepository, prompt: string): Promise<string | undefined> {
  return await window.showQuickPick(repository.submodules.map(r => r.name), { placeHolder: prompt });
}
