import { commands } from "vscode";
import { MenuItem } from "../menu/menuItem";
import { MagitRepository } from "../models/magitRepository";
import { DocumentView } from "../views/general/documentView";
import { MenuUtil } from "../menu/menu";


export async function fetching(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  let fetchingMenuItems: MenuItem[] = [];

  if (repository.magitState?.HEAD?.pushRemote) {
    const pushRemote = repository.magitState?.HEAD?.pushRemote;
    fetchingMenuItems.push({ label: "p", description: `${pushRemote.remote}/${pushRemote.name}`, action: fetchFromPushRemote });
  }

  if (repository.magitState?.HEAD?.upstream) {
    const upstream = repository.magitState?.HEAD?.upstream;
    fetchingMenuItems.push({ label: "u", description: `${upstream.remote}/${upstream.name}`, action: fetchFromUpstream });
  }

  fetchingMenuItems.push({ label: "e", description: "elsewhere", action: fetchFromElsewhere });

  fetchingMenuItems.push({ label: "a", description: "all remotes", action: fetchAll });


  // TODO: fill out rest of fetching menu

  fetchingMenuItems.push({ label: "o", description: "another branch", action: () => { } });

  return MenuUtil.showMenu({ title: "Fetching", commands: fetchingMenuItems }, { repository, currentView });
}

async function fetchFromPushRemote() {

}

async function fetchFromUpstream() {

}

async function fetchFromElsewhere() {

}

async function fetchAll() {
  return commands.executeCommand("git.fetchAll");
}