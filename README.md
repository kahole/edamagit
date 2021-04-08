<h1 align="center">
  <br>
  <a href="https://marketplace.visualstudio.com/items?itemName=kahole.magit">
    <img src="https://github.com/kahole/edamagit/raw/develop/images/edamagit_logo.png" alt="edamagit" width="120" />
  </a>
  <br>
  edamagit
  <br>
</h1>

<h3 align="center">Magit for VSCode, inspired by the awesome original <a href="https://magit.vc/" target="_blank">Magit</a>.</h3>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=kahole.magit">
      <img src="https://img.shields.io/visual-studio-marketplace/v/kahole.magit?color=green&label=VS%20Marketplace" />
  </a>
  <a href="https://open-vsx.org/extension/kahole/magit">
    <img src="https://img.shields.io/open-vsx/v/kahole/magit?color=blue" />
  </a>
  <a href="https://www.buymeacoffee.com/kahole" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" height="28">
  </a>
  <a href="https://github.com/sponsors/kahole" target="_blank"><img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=pink"></a>
</p>

<h3 align="center">
  <a href="#usage">Usage</a> •
  <a href="https://hole.dev/articles/edamagit-introduction/">Tutorial</a> •
  <a href="#settings">Settings</a> •
  <a href="#vim-support-vscodevim">Vim Bindings</a> •
  <a href="#roadmap">Roadmap</a>
</h3>

---

## Keyboard driven Git interface
![Usage](https://github.com/kahole/edamagit/raw/5ebf38107c6130cc16a23f18d84aeecc21f09fe8/magit_commit_demo.gif)

## Sub hunk staging
![Usage](https://github.com/kahole/edamagit/raw/5ebf38107c6130cc16a23f18d84aeecc21f09fe8/sub_hunk_staging.gif)
(Theme: [Dracula](https://draculatheme.com/))

## Usage

| VSCode Command                   | Default shortcut |
|----------------------------------|------------------|
| Magit Status                     | `alt+x g`        |
| Magit File Popup                 | `alt+x alt+g`    |
| Magit Dispatch                   | `alt+x ctrl+g`   |
| Magit Help (when in status view) | `?`              |

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
  shift+5 Worktree   o Submodules       shift+4 Process Log

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

  ctrl+j Move cursor to next entity
  ctrl+k Move cursor to previous entity
```

## [[ See also the edamagit tutorial ]](https://hole.dev/articles/edamagit-introduction/)
---


## Settings

- `Forge-enabled`: Enable Forge functionality (show pull requests, issues, etc from e.g. Github)
- `Display-buffer-function`: Choose which side for magit windows to open on.
- `Hide-status-sections`: Hide listed sections from status view.
- `Quick-switch-enabled`: Automatically confirm switch menu after enabling a switch (e.g. --force)

## Vim support (VSCodeVim)

All edamagit keybindings are customizable using VSCode's built-in `keybindings.json`.

Below are bindings providing evil-magit / spacemacs like keybindings.

The negative bindings, e.g. `-magit.discard-at-point` for key `k`,
remove the default edamagit bindings and the collisions with the Vim extension.

[Open your `keybindings.json`][kse] and paste the following JSON snippet.

[kse]: https://code.visualstudio.com/docs/getstarted/keybindings#_advanced-customization

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

### Interface
  - More interactivity in second-tier views (commit view, stash view, etc)
  - Config menus

### Missing Git/Magit features
  - More diffing features
  - More logging features (https://github.com/kahole/edamagit/pull/40)
  - Bisecting
  - Patches
  - Subtrees

### Missing Forge features
