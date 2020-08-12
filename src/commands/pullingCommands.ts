import { MagitRepository } from '../models/magitRepository';
import { MenuItem } from '../menu/menuItem';
import { MenuUtil, MenuState } from '../menu/menu';
import { commands } from 'vscode';
import { gitRun } from '../utils/gitRawRunner';

export async function pulling(repository: MagitRepository): Promise<any> {

  const pullingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    pullingMenuItems.push({ label: 'p', description: `${pushRemote.remote}/${pushRemote.name}`, action: pullFromPushRemote });
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    pullingMenuItems.push({ label: 'u', description: `${upstream.remote}/${upstream.name}`, action: pullFromUpstream });
  }

  pullingMenuItems.push({ label: 'e', description: 'elsewhere', action: pullFromElsewhere });

  return MenuUtil.showMenu({ title: 'Pulling', commands: pullingMenuItems }, { repository });
}

async function pullFromPushRemote({ repository }: MenuState) {
  const pushRemote = repository.magitState?.HEAD?.pushRemote;
  if (pushRemote) {
    const args = ['pull', pushRemote.remote, pushRemote.name];
    return gitRun(repository, args);
  }
}

function pullFromUpstream({ repository }: MenuState) {
  const args = ['pull'];
  return gitRun(repository, args);
}

async function pullFromElsewhere() {
  return commands.executeCommand('git.pullFrom');
}