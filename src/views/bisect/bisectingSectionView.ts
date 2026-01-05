import { MagitBisectState } from '../../models/magitBisectState';
import GitTextUtils from '../../utils/gitTextUtils';
import { LineBreakView } from '../general/lineBreakView';
import { SemanticTextView } from '../general/semanticTextView';
import { TextView } from '../general/textView';
import { View } from '../general/view';

export class BisectingSectionView extends View {
  get id() { return 'Bisecting_section'; }

  constructor(bisectState: MagitBisectState) {
    super();
    if (bisectState.bisecting) {
      this.addSubview(new TextView('Bisecting...'));
      this.addSubview(new SemanticTextView(`Good: ${GitTextUtils.shortHash(bisectState.good)}`));
      this.addSubview(new SemanticTextView(`Bad: ${GitTextUtils.shortHash(bisectState.bad)}`));
      this.addSubview(new LineBreakView());
    }
  }
}
