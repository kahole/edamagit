<h2 align="center"><img src="https://github.com/kahole/vscode-magit/raw/master/images/magit_logo.png" height="128"><br>Magit for VSCode (alpha)</h2>

### Inspired by the awesome, original, [Magit](https://magit.vc/) for Emacs  

### **Alpha**: use at own your own risk!

![Usage](https://github.com/kahole/vscode-magit/raw/c13e273164deac7fbfc7e19970a58f90f98bff67/magit_lowdef.gif)

## Usage

| VSCode Commands      | Default shortcut |
|---------------------|------------------|
| Magit Status        |   `ctrl+x g`      |
| Magit File Popup    |   `ctrl+x ctrl+g`    |
| Magit Dispatch      |   `ctrl+x alt+g`    |
| In Status: see all possible key-commands | `?` |


## Features

| Magit commands (**C-x g**)   | File popup commands (**C-x C-g**) |
|------------------------------|-----------------------------------|
| Status |Staging |
| Committing |Committing |
| Fetching | Diffing |
| Remoting | Blaming |
| Logging |
| Merging |
| Rebasing |
| Tagging |
| Pushing |
| Stashing |
| Resetting | 
| Applying |
| Discarding |


## Troubleshooting
### I can't commit
1. git config needs to be set, for repo or global  
`user.name` and `user.email`

2. `code` needs to be in your path  
(Doesn't apply to OS X)  
[Adding VSCode to path](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor)


## Roadmap

### Interface
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
- Have 100% own model and parser (not relying on git extension API)
  - More efficient, flexible, and stable
- Stable v1.0
