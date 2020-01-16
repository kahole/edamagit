import { TextView } from '../general/textView';
import { MagitChange } from '../../models/magitChange';
import { Status } from '../../typings/git';

export class ChangeHeaderView extends TextView {

  constructor(private change: MagitChange) {
    super();
    const statusLabel = mapFileStatusToLabel(this.change.status);
    this.textContent = `${statusLabel ? statusLabel + '   ' : ''}${this.change.relativePath}`;
  }

  onClicked() { return undefined; }
}

function mapFileStatusToLabel(status: Status): string {
  switch (status) {
    case Status.INDEX_MODIFIED:
    case Status.MODIFIED:
      return 'modified';
    case Status.INDEX_ADDED:
      return 'new file';
    case Status.INDEX_DELETED:
    case Status.DELETED:
      return 'deleted';
    case Status.INDEX_RENAMED:
      return 'renamed';
    case Status.INDEX_COPIED:
      return 'copied';
    case Status.UNTRACKED:
      return '';
    default:
      return '';
  }
}