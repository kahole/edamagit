## Introduction to edamagit

[edamagit](https://marketplace.visualstudio.com/items?itemName=kahole.magit) is a keyboard-driven git interface for VSCode. It's made in the style of the emacs extension [magit](https://magit.vc/).

Git commands are mapped to keypresses for efficient use. E.g. pressing `b c` will allow you to checkout a new branch.

Install it in VSCode by searching for `edamagit` in the extension manager.

Or get it here on one of these marketplaces
- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=kahole.magit)
- [OpenVSX](https://open-vsx.org/extension/kahole/magit)

### Status View

Bring up the status view by pressing `Alt+x g` _(`Alt` and `x` together, then `g` by itself)_.
Or by running the command `'Magit Status'` in the vscode [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).


Once in the status view, press `Tab` to fold and unfold sections, files, and change hunks.

Place the cursor on a section

![](https://hole.dev/images/edamagit_introduction/tab_closed.jpg)

press `Tab` to unfold/fold:

![](https://hole.dev/images/edamagit_introduction/tab_open.jpg)

#### Staging

Pressing `s` and `u` allows you to stage and unstage changes under the cursor. Either a file, change hunk, or a just a selected part of a hunk.

From

![](https://hole.dev/images/edamagit_introduction/unstaged_file.jpg)

pressing `s` will stage the file:

![](https://hole.dev/images/edamagit_introduction/staged_file.jpg)

#### Other status view actions

- `a` to apply the entity under the cursor. E.g. apply a stash
- `k` to delete changes/file/stash under cursor.
- `Enter` to open up the entity under cursor. (E.g. show commit details or open a file)

### Navigating the menus

From the status view press `?` to bring up the help view.

This shows you the available edamagit menus and which key to press to invoke them.
For example, pressing `b` brings up the `Branching`-menu.

![](https://hole.dev/images/edamagit_introduction/help_view.jpg)

This menu-system is based on a modified version of VSCode's QuickPick selection menu.

Similarly to the help view, the entries in this menu show a key and which action it activates. (e.g. `c Checkout new branch`)

From here, a single press of `c` invokes the action `Checkout new branch`.

![](https://hole.dev/images/edamagit_introduction/branching_menu_1.jpg)

Choose a branch to base the new branch on. Search and/or select with arrow keys. Confirm choice with `Enter`.

![](https://hole.dev/images/edamagit_introduction/branching_menu_2.jpg)

Give the new branch a name and press `Enter`

![](https://hole.dev/images/edamagit_introduction/branching_menu_3.jpg)

### Committing

Now you have staged some changes and want to commit.
Press `c` to bring up committing menu, and `c` once again to start a normal commit.

This brings up the commit view where you will write a commit message. Next to an editor showing which changes you are committing is shown.

![](https://hole.dev/images/edamagit_introduction/committing.jpg)

Once you have written a commit-message press `ctrl+c ctrl+c` to finish the commit.
Or manually save and close the commit-message editor, this has the same effect.

`ctrl+c ctrl+k` will abort the commit. (Saving and closing with the message empty is the same.)

### Switches

Some git commands are frequently used with switches or flags to enable some behaviors.
E.g. `push --force`

Many of the edamagit command menus have a switches menu which can be activated by pressing `-`.

![](https://hole.dev/images/edamagit_introduction/switches_1.jpg)

Toggle a switch by pressing its letter. E.g. `F` (uppercase) for `--force`.

![](https://hole.dev/images/edamagit_introduction/switches_2.jpg)

Press `Enter` to confirm the switch selection.

![](https://hole.dev/images/edamagit_introduction/switches_3.jpg)

Now you'll see the active switches listed in the 'Switches' menu entry.

![](https://hole.dev/images/edamagit_introduction/switches_4.jpg)

### Tips & Tricks
- Using the vscode command palette and typing `Magit ` will show you all available magit actions from where you currently are.
- Pressing `$` brings up the git process log where you can see the git commands that have been run, and their output/errors/etc.
- Enable Forge features in settings `Magit: Forge Enabled` to interact with Issues and PRs from github.
- Be aware that edamagit sometimes uses the vscode bottom status bar to hint at possible actions or display messages. (e.g. when committing it shows the keyboard shortcuts)

### Learn more
- [Youtube Tutorial - Jack Franklin](https://www.youtube.com/watch?v=kDISNtPYhjk)
- [Emacs Magit User Manual](https://magit.vc/manual/magit.html)

Updated 2021/01/29