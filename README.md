
## General
  - Go for MVP consisting of 90% of common use
  - plus all convenient features that come along with it

## USE CONST, not let

## Auto refresh
  - FileChangeEvent

## Highlighter
- hunk @@ blabla @@ line needs to be highlighted a bit
    > can this be done with syntax?
- branch names

## DIFF view
  - can use VSCODE diff command to show diff for a file? or something

## Workspaces
  - Needs to support multiple workspaces (Already do this somewhat)
  - Find out how to deal with status views and other views
  - Dispose of stuff when quit workspace etc..

## File menu. Magit activate menu for a file in the repo

## Main menu
  Alle views i magit støtter hovedmenyen
   Burde være DocumentView som sendes rundt!
   Alle disse trenger update når det skjer noe uansett.
   Dog forskjellig update, e.g magit Log state
   Finn ut av multiplexingen her

## UI
  - icons
        https://code.visualstudio.com/api/references/icons-in-labels
        e.g $(git-branch)

  - Transient interface:
     CONFIGURE should be just one action in the list.
       too much noise otherwise
       When selected bring up some configure interface i guess.

#### SOLUTION 1:
```
    this._quickPick.onDidChangeValue( (e) => {
      console.log(e);
      console.log(this._quickPick.value);
      this._quickPick.value = "";
      magitCommand();
    });
```
#### SOLUTION 2:
       her: https://stackoverflow.com/questions/58483907/how-to-add-the-custom-when-clause-in-vs-code
```
  commands.executeCommand('setContext', 'magit.branching', true);

{
  "command": "extension.magit.branching.checkout",
  "key": "c",
  "when": "inQuickOpen && magit.branching"
}
QuickPick blir da bare en visuell hjelpe-popup!
      da blir den context-aware begrensinger av kommandoer visuell (til å begynne med i hvertfall)
   også for å velge branches og switches etc!
```

  - Helm like branch selector: QuickPick https://code.visualstudio.com/api/references/vscode-api#QuickInput

  - Name stuff: InputBox
      e.g `window.showInputBox({prompt: "Name of your branch or whatever"});`

## Languages
  - Custom keybindings for buffer: define a language mode
  - Syntax
    - Embedded Diff language mode syntax!
      language mode "diff"
    - Highlight branch names dynamically
       https://code.visualstudio.com/api/references/vscode-api#languages.registerDocumentHighlightProvider

## Dispose

  - Proper use of dispose()
    https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/#disposables

    "This applies to event listening, commands, interacting with the UI, and various language contributions."

## Notes
  - Test on every platform

  - Licensing
      o Magit name trademark? vscodemagit / Magit for VSCode / VSCodeMagit
      o 100% gi credit Magit ofc
      o GPL2/3, MIT, etc
      o git.d.ts microsoft licence, effects?

  - VsVim?
    Maybe.. Is it possible to disable VSVim for certain languages / file extensions / etc?


-----

# magit README

Inspired/port by/of Magit https://magit.vc/

## Features

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
