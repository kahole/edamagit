<div align="center"><h2><img src="https://github.com/kahole/edamagit/raw/develop/images/edamagit_logo.png" height="140"><br/>edamagit</h2>
</div>

[![vsmarketbadge](https://vsmarketplacebadge.apphb.com/version-short/kahole.magit.svg)](https://marketplace.visualstudio.com/items?itemName=kahole.magit)
<a href="https://www.buymeacoffee.com/kahole" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" height="30"></a>

### Magit for VSCode, inspired by the awesome original [Magit](https://magit.vc/)

### **Alpha**: use at own your own risk!

![Usage](https://github.com/kahole/edamagit/raw/294aec866fbbd3a10b3d628af92823531793a244/magit_commit_demo.gif)
(Theme: [Dracula](https://draculatheme.com/))

### Table of Contents

- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
  * [I can't commit](#i-cant-commit)
  * [Vim support (VSCodeVim)](#vim-support-vscodevim)
- [Roadmap](#roadmap)

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
Popup commands
  A Cherry-pick       b Branch            c Commit
  d Diff              f Fetch             F Pull
  i Ignore            l Log               m Merge
  M Remote            P Push              r Rebase
  t Tag               V Revert            X Reset
  y Show Refs         z Stash             ! Run             % Worktree
 
Applying changes
  a Apply          s Stage          u Unstage
  v Reverse        S Stage all      U Unstage all
  k Discard
  
Essential commands
  g     refresh current buffer
  TAB   toggle section at point
  RET   visit thing at point
  $     show git process view
```

## Troubleshooting
### I can't commit
- git config needs to be set, for repo or global  
`user.name` and `user.email`

### Vim support (VSCodeVim)

Add these to your `keybindings.json` config file to get evil-magit / spacemacs like keybindings.
<details>
  <summary>keybindings.json</summary>
  
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
      "key": "x",
      "command": "magit.discard-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "k",
      "command": "-magit.discard-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "-",
      "command": "magit.reverse-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "v",
      "command": "-magit.reverse-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "shift+-",
      "command": "magit.reverting",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "shift+v",
      "command": "-magit.reverting",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "shift+o",
      "command": "magit.resetting",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "shift+x",
      "command": "-magit.resetting",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "x",
      "command": "-magit.reset-mixed",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "ctrl+u x",
      "command": "-magit.reset-hard",
      "when": "editorTextFocus && editorLangId == 'magit'"
    }
  ```
</details>

## Roadmap

_Feature requests as well as issues are welcome_

### Interface
- Config menus
- Options/variable menus
- Branch name highlighting     
     (https://github.com/microsoft/vscode/wiki/Semantic-Highlighting-Overview)

### Implement missing Git/Magit features
  - Logging (a lot missing)
  - Bisecting
  - Submodules
  - Patches

### Long term
- Stable v1.0
