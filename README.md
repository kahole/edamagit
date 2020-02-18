# Magit for VSCode (alpha)

*alpha*: use at own your own risk

Inspired by the awesome original (Magit)[https://magit.vc/] for Emacs

## Features

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

### Available features

Magit commands:

File popup commands:
- Blame
- Diff

## Usage
---

## Roadmap

- Config menus
- Options/variable menus
- Branch name highlighting     
     (https://github.com/microsoft/vscode/wiki/Semantic-Highlighting-Overview)

### Implement missing Git/Magit features
  - Diffing
  - Show refs
  - Cherry picking
  - Reverting
  - Bisecting
  - Worktree
  - Submodules
  - Patches

### Long term goals
- Own model and parser (not relying on git extension API)
  - More efficient, flexible, and stable
- Stable v1.0

--------

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

-----------------------------------------------------------------------------------------------------------