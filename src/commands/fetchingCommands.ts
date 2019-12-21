import { commands } from "vscode";


export async function magitFetch() {

  try {
    console.log('fetch');
    await fetchAll();

  } catch (error) {
    console.log(error);
  }
}

async function fetchAll() {
  return commands.executeCommand("git.fetchAll");
}