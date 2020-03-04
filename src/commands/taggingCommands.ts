import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import { window } from 'vscode';
import { RefType } from '../typings/git';

const taggingMenu = {
  title: 'Tagging',
  commands: [
    { label: 't', description: 'Create', action: createTag },
    { label: 'k', description: 'Delete', action: deleteTag },
    // { label: 'p', description: 'Prune', action: pruneTags }
  ]
};

export async function tagging(repository: MagitRepository) {

  const switches = [
    // { shortName: '-a', longName: '--annotate', description: 'Annotate' },
    { shortName: '-f', longName: '--force', description: 'Force' },
    // { shortName: '-s', longName: '--sign', description: 'Sign' }
  ];

  return MenuUtil.showMenu(taggingMenu, { repository, switches });
}

async function createTag({ repository, switches }: MenuState) {

  const tagName = await window.showInputBox({ prompt: 'Tag name' });

  if (tagName) {

    const ref = await MagitUtils.chooseRef(repository, 'Place tag on', true, true);

    if (ref) {

      const args = ['tag', ...MenuUtil.switchesToArgs(switches), tagName, ref];

      return await gitRun(repository, args);
    }
  }
}

async function deleteTag({ repository, switches }: MenuState) {

  const tagRef = await MagitUtils.chooseTag(repository, 'Delete tag');

  if (tagRef) {

    const args = ['tag', '-d', ...MenuUtil.switchesToArgs(switches), tagRef];

    return await gitRun(repository, args);
  }
}