import * as Constants from '../common/constants';
import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { processLog } from '../extension';
import { View } from './general/view';
import { MagitProcessLogEntry } from '../models/magitProcessLogEntry';
import { TextView } from './general/textView';
import { MagitState } from '../models/magitState';

class ProcessLogEntryView extends View {
  isFoldable = true;

  get id() { return '' + this.entry.index; }

  constructor(private entry: MagitProcessLogEntry) {
    super();
    this.addSubview(
      new TextView(entry.command.join(' '))
    );
    if (entry.stdout) {
      this.addSubview(new TextView(entry.stdout));
    }
    if (entry.stderr) {
      this.addSubview(new TextView(entry.stderr));
    }
  }
}

export default class ProcessView extends DocumentView {

  static UriPath: string = 'process.magit';

  constructor(uri: Uri) {
    super(uri);
    this.provideContent();
  }

  provideContent() {

    if (processLog.length > 0) {
      this.subViews = processLog.map(entry => new ProcessLogEntryView(entry));
    } else {
      this.subViews = [new TextView('(No entries yet)')];
    }
  }

  public update(state: MagitState): void {
    this.provideContent();
    this.triggerUpdate();
  }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${ProcessView.UriPath}?${repository.rootUri.path}#process`);
  }
}