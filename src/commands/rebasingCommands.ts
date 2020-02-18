import { MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import { MagitError } from '../models/magitError';

const whileRebasingMenu = {
  title: 'Rebasing',
  commands: [
    { label: 'r', description: 'Continue', action: (state: MenuState) => rebaseControlCommand(state, '--continue') },
    { label: 's', description: 'Skip', action: (state: MenuState) => rebaseControlCommand(state, '--skip') },
    // { label: 'e', description: 'Edit', action: (state: MenuState) => rebaseControlCommand(state, '--edit-todo') },
    { label: 'a', description: 'Abort', action: (state: MenuState) => rebaseControlCommand(state, '--abort') }
  ]
};

export async function rebasing(repository: MagitRepository) {

  const HEAD = repository.magitState?.HEAD;

  const commands = [];

  if (HEAD?.pushRemote) {
    commands.push({ label: 'p', description: `onto ${HEAD.pushRemote.remote}/${HEAD.pushRemote.name}`, action: rebase });
  }

  if (HEAD?.upstreamRemote) {
    commands.push({ label: 'u', description: `onto ${HEAD.upstreamRemote.remote}/${HEAD.upstreamRemote.name}`, action: rebase });
  }

  commands.push(...[
    { label: 'e', description: `onto elsewhere`, action: rebase },
    // { label: 'i', description: `interactively`, action: rebase },
  ]);

  const rebasingMenu = {
    title: `Rebasing ${HEAD?.name}`,
    commands
  };

  if (repository.magitState?.rebasingState) {
    return MenuUtil.showMenu(whileRebasingMenu, { repository });
  } else {
    return MenuUtil.showMenu(rebasingMenu, { repository });
  }
}

async function rebase({ repository }: MenuState) {
  const ref = await MagitUtils.chooseRef(repository, 'Rebase');

  if (ref) {
    return _rebase(repository, ref);
  }
}

async function _rebase(repository: MagitRepository, ref: string) {

  const args = ['rebase', ref];

  try {
    return await gitRun(repository, args);
  }
  catch (e) {
    throw new MagitError('Failed to merge in the changes.', e);
  }
}

async function rebaseControlCommand({ repository }: MenuState, command: string) {
  const args = ['rebase', command];
  return gitRun(repository, args);
}