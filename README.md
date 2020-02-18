# Magit for VSCode (alpha)
Inspired by the awesome original, [Magit](https://magit.vc/) for Emacs

**alpha**: use at own your own risk



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
| Help |


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
