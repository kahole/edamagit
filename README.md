<h2 align="center"><img src="https://github.com/kahole/vscode-magit/raw/master/images/magit_logo.png" height="100"><br>Magit for VSCode</h2>

[![vsmarketbadge](https://vsmarketplacebadge.apphb.com/version-short/kahole.magit.svg)](https://marketplace.visualstudio.com/items?itemName=kahole.magit)
<a href="https://www.buymeacoffee.com/kahole" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" height="30"></a>

### Inspired by the awesome original, [Magit](https://magit.vc/) for Emacs

### **Alpha**: use at own your own risk!

![Usage](https://github.com/kahole/vscode-magit/raw/294aec866fbbd3a10b3d628af92823531793a244/magit_commit_demo.gif)
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
| Help (when in magit)| `?` |

`> Magit ` in VSCode Command palette will show you all available Magit actions from where you are.


Keybindings inside Magit
```
Popup commands
  A Cherry-picking    b Branching         c Committing
  d Diffing           f Fetching          F Pulling
  i Ignoring          l Logging           m Merging
  M Remoting          P Pushing           r Rebasing
  t Tagging           V Reverting         X Resetting
  y Show Refs         z Stashing          ! Running           % Worktree
 
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
1. git config needs to be set, for repo or global  
`user.name` and `user.email`

2. `code` needs to be in your path  
(Doesn't apply to OS X)  
[Adding VSCode to path](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor)

### Vim support (VSCodeVim)

Add these to your `keybindings.json` config file
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
      "key": "o",
      "command": "magit.discard-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "k",
      "command": "-magit.discard-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "n",
      "command": "magit.reverse-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "v",
      "command": "-magit.reverse-at-point",
      "when": "editorTextFocus && editorLangId == 'magit'"
    }
    {
      "key": "shift+n",
      "command": "magit.reverting",
      "when": "editorTextFocus && editorLangId == 'magit'"
    },
    {
      "key": "shift+v",
      "command": "-magit.reverting",
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
