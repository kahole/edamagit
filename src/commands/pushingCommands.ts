import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { commands, window } from 'vscode';
import { MenuItem } from '../menu/menuItem';
import { MenuUtil, MenuState } from '../menu/menu';
import { Remote, RefType } from '../typings/git';
import { QuickItem, QuickMenuUtil } from '../menu/quickMenu';
import GitTextUtils from '../utils/gitTextUtils';

export async function pushing(repository: MagitRepository) {

  const pushingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    pushingMenuItems.push({ label: 'p', description: `${pushRemote.remote}/${pushRemote.name}`, action: pushToPushRemote });
  } else {
    pushingMenuItems.push({ label: 'p', description: `pushRemote, after setting that`, action: pushSetPushRemote });
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    pushingMenuItems.push({ label: 'u', description: `${upstream.remote}/${upstream.name}`, action: pushUpstream });
  } else {
    pushingMenuItems.push({ label: 'u', description: `@{upstream}, after setting that`, action: pushSetUpstream });
  }

  pushingMenuItems.push({ label: 'e', description: 'elsewhere', action: pushElsewhere });

  return MenuUtil.showMenu({ title: 'Pushing', commands: pushingMenuItems }, { repository });
}

async function pushToPushRemote({ repository }: MenuState) {

  const pushRemote = repository.magitState?.HEAD?.pushRemote;
  const ref = repository.magitState?.HEAD?.name;

  if (pushRemote) {
    return repository.push(pushRemote.remote, ref);
  }
}

async function pushSetPushRemote({ repository, ...rest }: MenuState) {
  const refs: QuickItem<string>[] = repository.state.remotes
    .map(r => ({ label: r.name, description: r.pushUrl, meta: r.name }));

  const chosenRemote = await QuickMenuUtil.showMenuWithFreeform(refs);

  const ref = repository.magitState?.HEAD?.name;

  if (chosenRemote && ref) {
    await repository.setConfig(`branch.${ref}.pushRemote`, chosenRemote);
    repository.magitState!.HEAD!.pushRemote = { name: ref, remote: chosenRemote };
    return pushToPushRemote({ repository, ...rest });
  }
}

async function pushUpstream() {
  return commands.executeCommand('git.push');
}

async function pushSetUpstream({ repository }: MenuState) {

  let choices = [...repository.state.refs];

  if (repository.state.remotes.length > 0 &&
    !choices.find(ref => ref.name === repository.magitState?.HEAD?.name && ref.remote === repository.state.remotes[0].name)) {
    choices = [{
      name: `${repository.state.remotes[0].name}/${repository.magitState?.HEAD?.name}`,
      remote: repository.state.remotes[0].name,
      type: RefType.RemoteHead
    }, ...choices];
  }

  const refs: QuickItem<string>[] = choices
    .map(r => ({ label: r.name!, description: GitTextUtils.shortHash(r.commit), meta: r.name! }));

  let chosenRemote;
  try {
    chosenRemote = await QuickMenuUtil.showMenu(refs);
  } catch { }

  const ref = repository.magitState?.HEAD?.name;

  if (chosenRemote) {

    await Promise.all([
      // MINOR: CLEAN UP THIS SPLIT MESS
      repository.setConfig(`branch.${ref}.merge`, `refs/heads/${chosenRemote.split('/')[1]}`),
      repository.setConfig(`branch.${ref}.remote`, chosenRemote.split('/')[0])
    ]);

    return pushUpstream();
  }
}

async function pushElsewhere() {
  return commands.executeCommand('git.pushTo');
}