import { commands, TextEditor, Range, window, Selection, TextEditorRevealType, Position } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { DocumentView } from '../views/general/documentView';
import { View } from '../views/general/view';
import { ChangeView } from '../views/changes/changeView';
import { HunkView } from '../views/changes/hunkView';

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

const subViewDepthSearchFlatten = (view: View, depth: number = 0): View[] => {
  if (view.folded || depth >= 3) {
    return [];
  }
  // .filter(v => v.isFoldable)
  return view.subViews.flatMap(v => [v, ...subViewDepthSearchFlatten(v, depth + 1)]);
};

export async function moveToNextEntity(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'next', 'entity');
}

export async function moveToPreviousEntity(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'previous', 'entity');
}

export async function moveToNextSection(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'next', 'section');
}

export async function moveToPreviousSection(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'previous', 'section');
}

export async function moveToNextChange(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'next', 'change');
}

export async function moveToPreviousChange(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'previous', 'change');
}

export async function moveToNextHunk(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'next', 'hunk');
}

export async function moveToPreviousHunk(repo: MagitRepository, view: DocumentView) {
  moveToNextPreviousEntity(view, 'previous', 'hunk');
}

export async function moveToUnstagedChanges(repo: MagitRepository, view: DocumentView) {
  moveToTargetEntity(view, 'unstaged-changes');
}

export async function moveToStagedChanges(repo: MagitRepository, view: DocumentView) {
  moveToTargetEntity(view, 'staged-changes');
}

function moveCursorAndReveal(position: Position) {
  window.activeTextEditor!.selection = new Selection(position, position);
  window.activeTextEditor!.revealRange(new Selection(position, position), TextEditorRevealType.Default);
}

function moveToTargetEntity(view: View, target: 'unstaged-changes' | 'staged-changes') {
  let views = (
    [view, ...subViewDepthSearchFlatten(view)]
    .filter(v =>
      target === 'unstaged-changes' ? v instanceof ChangeSectionView && v.section === 'Unstaged changes' :
      target === 'staged-changes' ? v instanceof ChangeSectionView && v.section === 'Staged changes' :
      false // Unreachable
    )
  );

  let targetView = views[0];
  if (targetView) {
    let nextLocation = targetView.range.start;
    moveCursorAndReveal(nextLocation);
  }
}

function moveToNextPreviousEntity(
  view: View,
  direction: 'next' | 'previous',
  filter: 'entity' | 'section' | 'change' | 'hunk',
) {
  const selectedView = view.click(window.activeTextEditor!.selection.active);

  if (selectedView) {

    let foldableViews = (
      [view, ...subViewDepthSearchFlatten(view)]
      .filter(v =>
        v === selectedView || (
          filter === 'entity' ? true :
          filter === 'section' ? v.constructor.name.endsWith('SectionView') :
          filter === 'change' ? v instanceof ChangeView :
          filter === 'hunk' ? v instanceof HunkView :
          false // Unreachable
        )
      )
    );

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

    if (filter === 'entity') {
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
}