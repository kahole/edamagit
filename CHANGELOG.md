# Change Log

### 0.1.6
- Performance and bugs

### 0.1.5
- Now possible to stage just selected lines from a change
    (Sub-hunk selection for stage/unstage/discard)

- Fixed issue where merging status didn't show all incoming commits

### 0.1.4
- Visiting a change will now place your cursor at the position in the file relative to the magit diff display
- Stash just index

### 0.1.3
- Unpushed/unpulled status for pushRemote (no longer just upstream)
- Stash just worktree
- Directly call file commands from file (e.g Magit Blame File)
- A bunch of bug fixes

### 0.1.2
- Interactive rebasing
- **Changed default top-level keybindings to avoid hijacking CUT shortcut on Linux and Windows**
  
  New defaults are:

  ```
    status = alt+x g
    file popup = alt+x alt+g
    dispatch = alt+x ctrl+g
  ```

- More colors

### 0.1.1
- Reverse-at-point
- Cherry pick --edit
- Bug fixes

### 0.1.0
- Cherry picking
- Reverting
- Git command running (raw commands)
- Git ignoring
- More colors
- Bug fixes

### 0.0.12
- Fixup commits (@zachdaniel Zach Daniel)
- Allow freeform input in more menus
- Bug fixes

### 0.0.11
- bug fix

### 0.0.10
- Opens repo picker when unsure of which repo.

    E.g. invoking 'status' from external file
- No longer requires text editor focus for top level magit keybindings

    i.e. status, file popup, and dispatch bindings
- Small bug fixes

### 0.0.9
- Adds diffing commands
- Fixes issue with discarding remote branches
- Visit ref heads commits from show-ref view

### 0.0.8
- Tag pushing
- Fixes bug with single key-stroke menu navigation

### 0.0.7
- Adds show-refs command
- Apply- and discard-at-point entities in show-ref view
- Worktree create commands

### 0.0.4
- Fixes issue with filename case

### 0.0.3
- Adds stashing switches
- Adds stash "keep index"
