import { MenuUtil, MenuState } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';

const applyPatchesMenu = {
  title: 'Apply patch',
  commands: [
    { label: 'm', description: 'Format patches', action: formatPatches },
    { label: 'w', description: 'Request pull', action: requestPull },
  ]
};

export async function formatPatchesCommands(repository: MagitRepository) {

  const switches = [
    { shortName: '-l', longName: '--cover-letter', description: 'Add cover letter' },
  ];

  return MenuUtil.showMenu(applyPatchesMenu, { repository, switches });
}

async function formatPatches({ repository, switches }: MenuState) {

}
async function requestPull({ repository, switches }: MenuState) {

}
