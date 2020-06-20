<h1 align="center">
  <br>
  <a href="https://marketplace.visualstudio.com/items?itemName=kahole.magit">
    <img src="https://github.com/kahole/edamagit/raw/develop/images/edamagit_logo.png" alt="Markdownify" width="160" />
  </a>
  <br>
  edamagit
  <br>
</h1>

<h4 align="center">Magit for VSCode, inspired by the awesome original <a href="https://magit.vc/" target="_blank">Magit</a>.</h4>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=kahole.magit">
      <img src="https://vsmarketplacebadge.apphb.com/version-short/kahole.magit.svg" >
  </a>
</p>

<p align="center">
  <a href="#usage">Usage</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#vim-support-vscodevim">Vim Bindings</a> •
  <a href="#roadmap">Roadmap</a>
</p>

![Usage](https://github.com/kahole/edamagit/raw/294aec866fbbd3a10b3d628af92823531793a244/magit_commit_demo.gif)
(Theme: [Dracula](https://draculatheme.com/))

## Usage

| VSCode Command      | Default shortcut |
|---------------------|------------------|
| Magit Status        |   `alt+x g`      |
| Magit File Popup    |   `alt+x alt+g`    |
| Magit Dispatch      |   `alt+x ctrl+g`    |
| Help (when in edamagit)| `?` |

`> Magit ` in VSCode Command palette will show you all available Magit actions from where you are.


Keybindings inside edamagit
```
Popup and dwim commands
  A Cherry-pick      b Branch           c Commit
  d Diff             f Fetch            F Pull
  I Ignore           l Log              m Merge
  M Remote           P Push             r Rebase
  t Tag              V Revert           X Reset
  y Show Refs        z Stash            shift+1 Run
  shift+5 Worktree

Applying changes
  a Apply          s Stage          u Unstage
  v Reverse        S Stage all      U Unstage all
  k Discard

Essential commands
  g        refresh current buffer
  TAB      toggle section at point
  RET      visit thing at point
  shift+4  show git process view
  q        exit / close magit view
```

## Troubleshooting
### I can't commit
- git config needs to be set, for repo or global  
`user.name` and `user.email`

## Vim support (VSCodeVim)

All edamagit keybindings are customizable using VSCode's built-in `keybindings.json`.

Below are bindings providing evil-magit / spacemacs like keybindings.

The negative bindings, e.g. `-magit.discard-at-point` for key `k`,
remove the default edamagit bindings and the collisions with the Vim extension.
<details>
  <summary>Bindings - keybindings.json</summary>
  
  ```json
    {
      "key": "tab",
      "command": "extension.vim_tab",
      "when": "editorFocus && vim.active && !inDebugRepl && vim.mode != 'Insert' && editorLangId != 'magit'"
    },
    {
      "key": "tab",
      "command": "-extension.vim_tab",
      "when": "editorFocus && vim.active && !inDebugRepl && vim.mode != 'Insert'"
    },
    {
      "key": "x",
      "command": "magit.discard-at-point",
      "when": "editorTextFocus && editorLangId == 'magit' && vim.mode =~ /^(?!SearchInProgressMode|CommandlineInProgress).*$/"
    },
    {
      "key": "k",
      "command": "-magit.discard-at-point"
    },
    {
      "key": "-",
      "command": "magit.reverse-at-point",
      "when": "editorTextFocus && editorLangId == 'magit' && vim.mode =~ /^(?!SearchInProgressMode|CommandlineInProgress).*$/"
    },
    {
      "key": "v",
      "command": "-magit.reverse-at-point"
    },
    {
      "key": "shift+-",
      "command": "magit.reverting",
      "when": "editorTextFocus && editorLangId == 'magit' && vim.mode =~ /^(?!SearchInProgressMode|CommandlineInProgress).*$/"
    },
    {
      "key": "shift+v",
      "command": "-magit.reverting"
    },
    {
      "key": "shift+o",
      "command": "magit.resetting",
      "when": "editorTextFocus && editorLangId == 'magit' && vim.mode =~ /^(?!SearchInProgressMode|CommandlineInProgress).*$/"
    },
    {
      "key": "shift+x",
      "command": "-magit.resetting"
    },
    {
      "key": "x",
      "command": "-magit.reset-mixed"
    },
    {
      "key": "ctrl+u x",
      "command": "-magit.reset-hard"
    }
  ```
</details>

## Roadmap

_Feature requests as well as issues are welcome_

### Implement missing Git/Magit features
  - Diffing (a lot missing)
  - More logging features (https://github.com/kahole/edamagit/pull/40)
  - Bisecting
  - Submodules
  - Patches

### Interface
- Config menus
- Options/variable menus
- Branch name highlighting     
     (https://github.com/microsoft/vscode/wiki/Semantic-Highlighting-Overview)
