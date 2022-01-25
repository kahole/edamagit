import { MenuItem, MenuState, MenuUtil } from '../menu/menu';
import { PickMenuUtil } from '../menu/pickMenu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';

function generatePullingMenu(repository: MagitRepository) {
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
  return { title: 'Pulling', commands: pullingMenuItems };
}

export async function pulling(repository: MagitRepository): Promise<any> {
  const switches = [
    { key: '-r', name: '--rebase', description: 'Rebase local commits' },
    { key: '-p', name: '--prune', description: 'Prune deleted branches' }
  ];

  return MenuUtil.showMenu(generatePullingMenu(repository), { repository, switches });
}

async function pullFromPushRemote({ repository, switches }: MenuState) {
  const pushRemote = repository.HEAD?.pushRemote;
  if (pushRemote) {
    const args = ['pull', ...MenuUtil.switchesToArgs(switches), pushRemote.remote, pushRemote.name];
    return gitRun(repository.gitRepository, args);
  }
}

function pullFromUpstream({ repository, switches }: MenuState) {
  const args = ['pull', ...MenuUtil.switchesToArgs(switches)];
  return gitRun(repository.gitRepository, args);
}

async function pullFromElsewhere({ repository, switches }: MenuState) {
  const elseWhere = repository.remotes
    .flatMap(r =>
      r.branches
        .map(b => b.name)
        .filter((n): n is string => !!n)
    )
    .map(r => ({ label: r, meta: r }));

  const chosenElse = await PickMenuUtil.showMenu(elseWhere, 'Pull');
  if (chosenElse) {
    const idx = chosenElse.indexOf('/');
    const remote = chosenElse.slice(0, idx);
    const branch = chosenElse.slice(idx+1);
    const args = ['pull', ...MenuUtil.switchesToArgs(switches), remote, branch];
    return gitRun(repository.gitRepository, args);
  }
}