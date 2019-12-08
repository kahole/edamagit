# TODO

## General
  - Use existing tooling as much as possible
    make magit, but the fancy stuff should be vscode like

## Git
  - Git: either use vscode.git or run commands and "parse"
     Nice example:
       https://github.com/DonJayamanne/gitHistoryVSCode/blob/master/src/adapter/exec/gitCommandExec.ts

  - Git extension API
        https://github.com/microsoft/vscode/blob/master/extensions/git/src/api/api1.ts
     noe svakt, men exposer git executable

## UI
  - Transient interface:
    - Enkel: See section: languages->custom keybindings
     Avansert (HELST IKKE):Key presses: https://github.com/lucax88x/CodeAceJumper/blob/master/src/inline-input.ts#L81

  - Command pallete
      When a command should be available: https://code.visualstudio.com/api/extension-guides/command#controlling-when-a-command-shows-up-in-the-command-palette
      https://code.visualstudio.com/api/extension-guides/command#enablement-of-commands
     - Dynamic selection, filter with `executeCommand("workbench.action.quickOpen", ">commandPREFIX");`

  - Helm like branch selector: QuickPick https://code.visualstudio.com/api/references/vscode-api#QuickInput
        window.showQuickPick(repository.state.refs.map( r => r.name!));
          repository.checkout(branch.name)

  - Name stuff: InputBox
      e.g `window.showInputBox({prompt: "Name of your branch or whatever"});`

  - Commit message: EASY
        `git config core.editor "code --wait"`
         opens commit msg editor in vscode

        Change back and forth:
        ```bash
        previousEditor = git config core.editor
        git config core.editor "code --wait"
        git commit
        git config core.editor "$previousEditor"
        ```

### Folding: 
    - enkel
       https://code.visualstudio.com/api/language-extensions/language-configuration-guide
    - avansert folding (HELST IKKE)
       https://stackoverflow.com/questions/56509396/vscode-extension-folding-section-based-on-first-blank-line-found-or-to-the-sta
       https://code.visualstudio.com/api/references/vscode-api#FoldingRangeProvider
      https://code.visualstudio.com/api/references/vscode-api#languages.registerFoldingRangeProvider

### Feedback, errors:
  - Status bar message for git feedback or Info Box
  - Errors: show ErrorMessage for feil

## Languages
  - Custom keybindings for buffer: define a language mode
    - Example
      ```json
      {
        "command": "editor.toggleFold",
        "key": "tab",
        "when": "editorTextFocus && editorLangId == magit-status"
      },
      ```
  - Syntax
    - Embedded Diff language mode syntax!
      language mode "diff"
    - Highlight branch names dynamically
       https://code.visualstudio.com/api/references/vscode-api#languages.registerDocumentHighlightProvider

## Notes
  - VsVim:
     Needs to work well with VsVim as well

  - God inspo - REST client mode
      https://github.com/Huachao/vscode-restclient


-----

# magit README

Inspired/port by/of Magit https://magit.vc/

This is the README for your extension "magit". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

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
