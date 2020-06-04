import { MagitRepository } from '../models/magitRepository';
import { View } from '../views/general/view';
import { Selection, Position } from 'vscode';

export default class ViewUtils {

  public static applyActionForSelection(repository: MagitRepository, currentView: View, selection: Selection, multiSelectableViewTypes: any[], action: Function): Promise<any> {

    if (!selection.isSingleLine) {

      let clickedViews = ViewUtils.multilineClick(currentView, selection, multiSelectableViewTypes);

      if (clickedViews.length > 0) {

        let actionTasks = clickedViews.map(v => action(repository, selection, v));
        return Promise.all(actionTasks);
      }
    }

    const selectedView = currentView.click(selection.active);
    return action(repository, selection, selectedView);
  }

  private static multilineClick(currentView: View, selection: Selection, applicableViewTypes: any[]): View[] {

    let selectedViews: View[] = [];
    let type: any = null;

    for (let line = selection.start.line; line <= selection.end.line; line++) {
      let clicked = currentView.click(new Position(line, 0));

      if (clicked && applicableViewTypes.find(viewType => clicked instanceof viewType)) {
        if (!type) {
          type = clicked.constructor;
        }
        if (type === clicked.constructor) {
          selectedViews.push(clicked);
        }
      }
    }

    return selectedViews;
  }
}