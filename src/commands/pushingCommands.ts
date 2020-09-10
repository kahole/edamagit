import { MagitRepository } from '../models/magitRepository';
import { commands } from 'vscode';
import { MenuUtil, MenuState, MenuItem } from '../menu/menu';
import { RefType } from '../typings/git';
import { PickMenuItem, PickMenuUtil } from '../menu/pickMenu';
import GitTextUtils from '../utils/gitTextUtils';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import GitUtils from '../utils/gitUtils';

function generatePushingMenu(repository: MagitRepository) {
  const pushingMenuItems: MenuItem[] = [];

  if (repository.magitState.HEAD?.pushRemote) {
    const pushRemote = repository.magitState.HEAD?.pushRemote;
    pushingMenuItems.push({ label: 'p', description: `${pushRemote.remote}/${pushRemote.name}`, action: pushToPushRemote });
  } else {
    pushingMenuItems.push({ label: 'p', description: `pushRemote, after setting that`, action: pushSetPushRemote });
  }

  if (repository.magitState.HEAD?.upstream) {
    const upstream = repository.magitState.HEAD?.upstream;
    pushingMenuItems.push({ label: 'u', description: `${upstream.remote}/${upstream.name}`, action: pushUpstream });
  } else {
    pushingMenuItems.push({ label: 'u', description: `@{upstream}, after setting that`, action: pushSetUpstream });
  }

  pushingMenuItems.push({ label: 'e', description: 'elsewhere', action: pushElsewhere });
  pushingMenuItems.push({ label: 'T', description: 'a tag', action: pushTag });
  pushingMenuItems.push({ label: 't', description: 'all tags', action: pushAllTags });

  return { title: 'Pushing', commands: pushingMenuItems };
}

export async function pushing(repository: MagitRepository) {

  const switches = [
    { key: '-f', name: '--force-with-lease', description: 'Force with lease' },
    { key: '-F', name: '--force', description: 'Force' },
    { key: '-h', name: '--no-verify', description: 'Disable hooks' },
    { key: '-d', name: '--dry-run', description: 'Dry run' }
  ];

  return MenuUtil.showMenu(generatePushingMenu(repository), { repository, switches });
}

async function pushToPushRemote({ repository, switches }: MenuState) {

  const pushRemote = repository.magitState.HEAD?.pushRemote;
  const ref = repository.magitState.HEAD?.name;

  if (pushRemote?.remote && ref) {

    const args = ['push', ...MenuUtil.switchesToArgs(switches), pushRemote.remote, ref];
    return gitRun(repository, args);
  }
}

async function pushSetPushRemote({ repository, ...rest }: MenuState) {
  const remotes: PickMenuItem<string>[] = repository.magitState.remotes
    .map(r => ({ label: r.name, description: r.pushUrl, meta: r.name }));

  const chosenRemote = await PickMenuUtil.showMenu(remotes);

  const ref = repository.magitState.HEAD?.name;

  if (chosenRemote && ref) {
    await GitUtils.setConfigVariable(repository, `branch.${ref}.pushRemote`, chosenRemote);

    repository.magitState.HEAD!.pushRemote = { name: ref, remote: chosenRemote };
    return pushToPushRemote({ repository, ...rest });
  }
}

async function pushUpstream({ repository, switches }: MenuState) {

  const upstreamRemote = repository.magitState.HEAD?.upstreamRemote;
  const ref = repository.magitState.HEAD?.name;

  if (upstreamRemote?.remote && ref) {

    const args = ['push', ...MenuUtil.switchesToArgs(switches), upstreamRemote.remote, ref];
    return gitRun(repository, args);
  }
}

async function pushSetUpstream({ repository, ...rest }: MenuState) {

  let choices = [...repository.magitState.refs];

  if (repository.magitState.remotes.length > 0 &&
    !choices.find(ref => ref.name === repository.magitState.remotes[0].name + '/' + repository.magitState.HEAD?.name)) {
    choices = [{
      name: `${repository.magitState.remotes[0].name}/${repository.magitState.HEAD?.name}`,
      remote: repository.magitState.remotes[0].name,
      type: RefType.RemoteHead
    }, ...choices];
  }

  const refs: PickMenuItem<string>[] = choices
    .filter(ref => ref.type !== RefType.Tag && ref.name !== repository.magitState.HEAD?.name)
    .sort((refA, refB) => refB.type - refA.type)
    .map(r => ({ label: r.name!, description: GitTextUtils.shortHash(r.commit), meta: r.name! }));

  let chosenRemote;
  try {
    chosenRemote = await PickMenuUtil.showMenu(refs);
  } catch { }

  const ref = repository.magitState.HEAD?.name;

  if (chosenRemote && ref) {

    const [remote, name] = GitTextUtils.remoteBranchFullNameToSegments(chosenRemote);

    if (remote && name) {

      await Promise.all([
        GitUtils.setConfigVariable(repository, `branch.${ref}.merge`, `refs/heads/${name}`),
        GitUtils.setConfigVariable(repository, `branch.${ref}.remote`, remote)
      ]);

      repository.magitState.HEAD!.upstreamRemote = { name, remote };

      return pushUpstream({ repository, ...rest });
    }
  }
}

async function pushElsewhere() {
  return commands.executeCommand('git.pushTo');
}

async function pushTag({ repository, switches }: MenuState) {
  const remote = repository.magitState.HEAD?.upstreamRemote?.remote ?? repository.magitState.HEAD?.pushRemote?.remote;

  const tag = await MagitUtils.chooseTag(repository, 'Push tag');

  if (remote && tag) {

    const args = ['push', ...MenuUtil.switchesToArgs(switches), remote, tag];
    return gitRun(repository, args);
  }
}

async function pushAllTags({ repository, switches }: MenuState) {
  const remote = repository.magitState.HEAD?.upstreamRemote?.remote ?? repository.magitState.HEAD?.pushRemote?.remote;

  if (remote) {

    const args = ['push', ...MenuUtil.switchesToArgs(switches), remote, '--tags'];
    return gitRun(repository, args);
  }
}