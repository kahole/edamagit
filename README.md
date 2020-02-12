
## TODO: make options MENU also. and do for a command

## TODO: Config interface, or:
```
  return workspace.openTextDocument(repository.rootUri.fsPath + '/.git/config').then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: true }));
```

## MINOR: NB! Thenables dont work with regular try/catch ?!

## Dispose
  - Proper use of dispose()
    https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/#disposables
    "This applies to event listening, commands, interacting with the UI, and various language contributions."

## BEFORE
  - Test on windows, linux

  - Licensing, crediting?
      o magit
      o git.d.ts microsoft licenced, ?

-----

# Magit for VSCode (alpha)

!alpha: use at own your own risk

Inspired by the original (Magit)[https://magit.vc/] for Emacs

# Roadmap

- [ ] Stable v1.0
- [ ] Feature parity with Magit
      - log all commands, $ view
      - Diffing
      - Reverting
      - Resetting
      - Tagging
      - Bisecting
      - Worktree
      - Cherry picking
      - Config

--------

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

-----------------------------------------------------------------------------------------------------------