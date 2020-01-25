import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { commands, window } from 'vscode';
import { DocumentView } from '../views/general/documentView';
import { MenuItem } from '../menu/menuItem';
import { MenuUtil, MenuState } from '../menu/menu';
import { Remote } from '../typings/git';
import { QuickItem, QuickMenuUtil } from '../menu/quickMenu';
import GitTextUtils from '../utils/gitTextUtils';

export async function pushing(repository: MagitRepository, currentView: DocumentView) {

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

  return MenuUtil.showMenu({ title: 'Pushing', commands: pushingMenuItems }, { repository, currentView });
}

// Dont use this.. use Vscode commands as much as possible

// Hvordan git push kommandoen bygges opp:
// https://github.com/microsoft/vscode/blob/master/extensions/git/src/git.ts#L1491

// kun "git push" slik den står nå
// currentRepository._repository.pushTo()
//   .then(() => console.log("klarte å pushe ?"))
//   .catch(console.log);

// _repository pushTo(remote?: string, name?: string, setUpstream?: boolean, forcePushMode?: ForcePushMode): Promise<void>

// currentRepository.push()
//  .then(
//     display success message in status area, or info box
//  )
//  .catch(
//        handleError somehow


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

  const chosenRemote = await QuickMenuUtil.showMenu(refs);

  // Freeform
  //  OR: if no match, use the freeform input as a new upstream
  // if (chosenRemote === undefined) {
  // chosenRemote = await window.showInputBox({ prompt: '' });
  // }

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

  const refs: QuickItem<string>[] = repository.state.refs
    .map(r => ({ label: r.name!, description: GitTextUtils.shortHash(r.commit), meta: r.name! }));

  let chosenRemote;
  try {
    chosenRemote = await QuickMenuUtil.showMenu(refs);
  } catch { }

  const ref = repository.magitState?.HEAD?.name;

  // Freeform
  //  OR: if no match, use the freeform input as a new upstream
  if (!chosenRemote) {
    chosenRemote = await window.showInputBox({ prompt: `Set of ${ref} upstream to` });
  }

  // TODO: push, setUpstream all in one call?
  // repository.push(remote, branch, setUpstream=true)
  // Does it set merge also?
  // also: clean up..

  // return repository.push(chosenRemote, ref, true);
  if (chosenRemote) {

    await Promise.all([
      // CLEAN UP THIS SPLIT MESS
      repository.setConfig(`branch.${ref}.merge`, `refs/heads/${chosenRemote.split('/')[1]}`),
      repository.setConfig(`branch.${ref}.remote`, chosenRemote.split('/')[0])
    ]);

    return pushUpstream();
  }
}

async function pushElsewhere() {
  return commands.executeCommand('git.pushTo');
}