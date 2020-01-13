import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';
import { commands, window } from 'vscode';
import { DocumentView } from '../views/general/documentView';
import { MenuItem } from '../menu/menuItem';
import { MenuUtil, MenuState } from '../menu/menu';
import { Remote } from '../typings/git';
import { QuickItem, QuickMenuUtil } from '../menu/quickMenu';

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


async function pushToPushRemote() {

}

async function pushSetPushRemote() {

}

async function pushUpstream() {
  // This is probably correct
  return commands.executeCommand('git.push');
}

async function pushSetUpstream({ repository, currentView }: MenuState) {

  const refs: QuickItem<string>[] = repository.state.refs
    .map(r => ({ label: r.name!, meta: r.name! }));

  let chosenRemote = (await QuickMenuUtil.showMenu(refs)).meta;


  // Freeform
  //  OR: if no match, use the freeform input as a new upstream
  // if (chosenRemote === undefined) {
  // chosenRemote = await window.showInputBox({ prompt: '' });
  // }

  // TODO: fix and clean up

  const ref = repository.magitState?.HEAD?.name;

  await Promise.all([
    // CLEAN UP THIS SPLIT MESS
    repository.setConfig(`branch.${ref}.merge`, `refs/heads/${chosenRemote.split('/')[1]}`),
    repository.setConfig(`branch.${ref}.remote`, chosenRemote.split('/')[0])
  ]);

  return pushUpstream();
}

async function pushElsewhere() {
  return commands.executeCommand('git.pushTo');
}