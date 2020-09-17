import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState, MenuItem } from '../menu/menu';
import { commands } from 'vscode';
import { gitRun } from '../utils/gitRawRunner';

export async function pulling(repository: MagitRepository): Promise<any> {

  const pullingMenuItems: MenuItem[] = [];

  if (repository.HEAD?.pushRemote) {
    const pushRemote = repository.HEAD?.pushRemote;
    pullingMenuItems.push({ label: 'p', description: `${pushRemote.remote}/${pushRemote.name}`, action: pullFromPushRemote });
  }

  if (repository.HEAD?.upstream) {
    const upstream = repository.HEAD?.upstream;
    pullingMenuItems.push({ label: 'u', description: `${upstream.remote}/${upstream.name}`, action: pullFromUpstream });
  }

  pullingMenuItems.push({ label: 'e', description: 'elsewhere', action: pullFromElsewhere });

  return MenuUtil.showMenu({ title: 'Pulling', commands: pullingMenuItems }, { repository });
}

async function pullFromPushRemote({ repository }: MenuState) {
  const pushRemote = repository.HEAD?.pushRemote;
  if (pushRemote) {
    const args = ['pull', pushRemote.remote, pushRemote.name];
    return gitRun(repository.gitRepository, args);
  }
}

function pullFromUpstream({ repository }: MenuState) {
  const args = ['pull'];
  return gitRun(repository.gitRepository, args);
}

async function pullFromElsewhere() {
  return commands.executeCommand('git.pullFrom');
}