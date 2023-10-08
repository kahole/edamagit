import { commands, TextEditor, Range, window, Selection, TextEditorRevealType, Position } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { ChangeView } from '../views/changes/changeView';
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

export async function toggleAllFoldsInChangeSection(repo: MagitRepository, view: DocumentView) {
  const selectedView = view.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof ChangeSectionView) {
    let changeSectionView = selectedView as ChangeSectionView;
    if (changeSectionView.subViews.length < 2) {
      return;
    }
    let newFoldState = !changeSectionView.subViews[1].folded;

    for (let i = 1; i < changeSectionView.subViews.length - 1; i++) {
      changeSectionView.subViews[i].folded = newFoldState;
    }
  }
}

export async function toggleAllFoldsForChangeViews(repo: MagitRepository, view: DocumentView) {
  let changeViews = Array.from(view.walkAllSubViews()).filter(x => x instanceof ChangeView);
  if (changeViews.length === 0) {
    return;
  }
  const newFoldState = !changeViews[0].folded;
  for (let changeView of changeViews) {
    changeView.folded = newFoldState;
  }
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

function moveCursorAndReveal(position: Position) {
  window.activeTextEditor!.selection = new Selection(position, position);
  window.activeTextEditor!.revealRange(new Selection(position, position), TextEditorRevealType.Default);
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
        moveCursorAndReveal(nextLocation);
        return;
      }
    }

    // Avoid standing still and getting stuck
    if (direction === 'next') {
      let newPos = selectedView.range.end.with({ line: selectedView.range.end.line });
      moveCursorAndReveal(newPos);
    } else if (direction === 'previous') {
      if (selectedView.range.start.line > 0) {
        let newPos = selectedView.range.start.with({ line: selectedView.range.start.line - 1 });
        moveCursorAndReveal(newPos);

      }
    }
  }
}