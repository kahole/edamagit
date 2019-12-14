import { View } from "../abstract/view";
import { Section, SectionHeaderView } from "../sectionHeader";
import { LineBreakView } from "../lineBreakView";
import { Stash } from "../../common/gitApiExtensions";
import { TextView } from "../abstract/textView";
import { Remote } from "../../typings/git";

// https://emacs.stackexchange.com/questions/26247/meaning-of-magit-status-buffer-head-merge-push



// https://magit.vc/manual/magit/The-Two-Remotes.html




// export class BranchHeaderSectionView extends View {

//   constructor(head: Branch, remotes: Remote) {
//     super();
//     this.subViews = [
//       new SectionHeaderView(Section.Stashes, stashes.length),
//       ...stashes.map(stash => new BranchHeaderView(stash)),
//       new LineBreakView()
//     ];
//   }
// }

// export class BranchHeaderView extends TextView {

//   constructor (stash: Stash) {
//     super();
//     this.textContent = `stash@{${stash.index}} ${stash.description}`;
//   }
// }