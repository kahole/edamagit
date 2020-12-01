import { commands, TextEditor, Range, window, Selection } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { View } from '../views/general/view';

export async function saveClose() {
  await commands.executeCommand('workbench.action.files.save');
  return commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function clearSaveClose(editor: TextEditor) {
  await editor.edit(editBuilder => {
    editBuilder.delete(new Range(0, 0, 1000, 0));
  });
  return saveClose();
}

// workaround for issue #11
export async function quitMagitView() {
  return commands.executeCommand('workbench.action.closeActiveEditor');
}


const subViewDepthSearchFlatten = (view: View, depth: number = 0): View[] => {
  if (view.folded || depth >= 3) {
    return [];
  }
  // .filter(v => v.isFoldable)
  return view.subViews.flatMap(v => [v, ...subViewDepthSearchFlatten(v, depth + 1)]);
};

export async function moveToNextEntity(repo: MagitRepository, view: DocumentView) {
  moveToEntity(view, 'next');
}

export async function moveToPreviousEntity(repo: MagitRepository, view: DocumentView) {
  moveToEntity(view, 'previous');
}

function moveToEntity(view: View, direction: 'next' | 'previous') {
  const selectedView = view.click(window.activeTextEditor!.selection.active);

  if (selectedView) {

    let foldableViews = [view, ...subViewDepthSearchFlatten(view)];

    if (direction === 'previous') {
      foldableViews = foldableViews.reverse();
    }

    let nextviewIndex = foldableViews.indexOf(selectedView);

    if (nextviewIndex !== -1) {

      let nextView = foldableViews.slice(nextviewIndex + 1).find(v => v.isFoldable);

      if (nextView) {
        let nextLocation = nextView.range.start;
        window.activeTextEditor!.selection = new Selection(nextLocation, nextLocation);
        return;
      }
    }

    // Avoid standing still and getting stuck
    if (direction === 'next') {
      let newPos = selectedView.range.end.with({ line: selectedView.range.end.line });
      window.activeTextEditor!.selection = new Selection(newPos, newPos);
    } else if (direction === 'previous') {
      if (selectedView.range.start.line > 0) {
        let newPos = selectedView.range.start.with({ line: selectedView.range.start.line - 1 });
        window.activeTextEditor!.selection = new Selection(newPos, newPos);
      }
    }
  }
}