<h2 align="center"><img src="https://github.com/kahole/vscode-magit/raw/master/images/magit_logo.png" height="128"><br>Magit for VSCode</h2>

[![vsmarketbadge](https://vsmarketplacebadge.apphb.com/version-short/kahole.magit.svg)](https://marketplace.visualstudio.com/items?itemName=kahole.magit)

### Inspired by the awesome original, [Magit](https://magit.vc/) for Emacs  

### **Alpha**: use at own your own risk!

![Usage](https://github.com/kahole/vscode-magit/raw/c13e273164deac7fbfc7e19970a58f90f98bff67/magit_lowdef.gif)

### Table of Contents

- [Usage](#usage)
- [Features](#features)
- [Troubleshooting](#troubleshooting)
  * [I can't commit](#i-can-t-commit)
  * [Vim support (VSCodeVim)](#vim-support--vscodevim-)
- [Roadmap](#roadmap)

## Usage

| VSCode Commands      | Default shortcut |
|---------------------|------------------|
| Magit Status        |   `ctrl+x g`      |
| Magit File Popup    |   `ctrl+x ctrl+g`    |
| Magit Dispatch      |   `ctrl+x alt+g`    |
| In Status: see all possible key-commands | `?` |

From status view
```
Popup commands
  d Diffing           b Branching        c Committing
  f Fetching          F Pulling          l Logging 
  m Merging           M Remoting         t Tagging
  P Pushing           r Rebasing         X Resetting
  y Show Refs         z Stashing         % Worktree
 
Applying changes
  a Apply          s Stage          u Unstage
  k Discard        S Stage all      U Unstage all
  
 
Essential commands
  g     refresh current buffer
  TAB   toggle section at point
  RET   visit thing at point
  $     show git process view
```

## Features

| Magit commands (**C-x g**)   | File popup commands (**C-x C-g**) |
|------------------------------|-----------------------------------|
| Status |Staging |
| Committing |Committing |
| Fetching | Diffing |
| Remoting | Blaming |
| Logging |
| Diffing |
| Merging |
| Rebasing |
| Tagging |
| Pushing |
| Stashing |
| Resetting | 
| Applying |
| Discarding |
| Show refs  |
| Worktee    |
| Visit-at-point |
| Git Process view |

## Troubleshooting
### I can't commit
1. git config needs to be set, for repo or global  
`user.name` and `user.email`

2. `code` needs to be in your path  
(Doesn't apply to OS X)  
[Adding VSCode to path](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor)

### Vim support (VSCodeVim)

Add these to your `keybindings.json` config file

```json
  {
    "key": "tab",
    "command": "extension.vim_tab",
    "when": "editorFocus && vim.active && !inDebugRepl && vim.mode != 'Insert' && !editorLangId == 'magit'"
  },
  {
    "key": "tab",
    "command": "-extension.vim_tab",
    "when": "editorFocus && vim.active && !inDebugRepl && vim.mode != 'Insert'"
  },
  {
    "key": "o",
    "command": "magit.discard-at-point",
    "when": "editorTextFocus && editorLangId == 'magit'"
  },
  {
    "key": "k",
    "command": "-magit.discard-at-point",
    "when": "editorTextFocus && editorLangId == 'magit'"
  }
```
and if you have Vim ctrl keys enabled `"vim.useCtrlKeys"`, you **might** need to add these to your `keybindings.json` to overpower Vim

```json
  {
    "command": "magit.status",
    "key": "ctrl+x g"
  },
  {
    "command": "magit.dispatch",
    "key": "ctrl+x alt+g"
  },
  {
    "command": "magit.file-popup",
    "key": "ctrl-x ctrl+g"
  }
```

## Roadmap

_Feature requests as well as issues are welcome_

### Interface
- Config menus
- Options/variable menus
- Branch name highlighting     
     (https://github.com/microsoft/vscode/wiki/Semantic-Highlighting-Overview)

### Implement missing Git/Magit features
  - Cherry picking
  - Reverting
  - Reversing
  - Bisecting
  - Submodules
  - Patches

### Long term goals
- Have 100% own model and parser (not relying on git extension API)
  - More efficient, flexible, and stable
- Stable v1.0
