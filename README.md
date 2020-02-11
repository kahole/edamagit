
## TODO: SIMPLE add more switches
## TODO: make options MENU also. and do for a command

## TODO BUGS
Bug#5
    C-c C-k doesnt abort MERGE_MSG commit

## MINOR: break out / refactor commands vs internal commands a bit?
## MINOR: NB! Thenables dont work with regular try/catch !

## Feature requests
- log all gitRun commands, $ view

- Diffing
- Reverting
- Resetting
- Tagging
- Bisecting
- Worktree
- etc

## Dispose
  - Proper use of dispose()
    https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/#disposables
    "This applies to event listening, commands, interacting with the UI, and various language contributions."

## BEFORE
  - Test on windows, linux

  - Licensing, crediting?
      o magit
      o git.d.ts microsoft licenced, effects?

-----

# Magit for VSCode (alpha)

!alpha: use at own your own risk ??

Inspired by the original (Magit)[https://magit.vc/] for Emacs

# Roadmap

- [ ] Stable v1.0
- [ ] Feature parity with Magit

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