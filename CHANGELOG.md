# Changelog

## [0.6.2] - 2020-12-20
- Bug fix with forge cache

## [0.6.1] - 2020-12-19
### Forge
- Adds detail views to Issues and PullRequests (visit by pressing enter on them)

## [0.6.0] - 2020-12-13

### Forge basic PR functionality
- Enable it in vscode settings: `magit.forge-enabled`

Functionality:
- See Pull requests list in status view
- Checkout from 'Branching' menu: `Check out pull request`
- Only github.com currently supported.

Thanks, @roblabla - Robin Lambertz for help with implementation.

## [0.5.8] - 2020-12-08
- Reveal cursor when jumping out of the viewport with `ctrl+j` and `ctrl+k`

## [0.5.7] - 2020-12-02
- Use `ctrl+j` and `ctrl+k` to jump between entities in e.g. Status view.
- Small improvements

## [0.5.6] - 2020-11-28
- Makes Y or N confirmation dialog single key press to complete (No 'Enter' key press required, only Y or N).
- Fixes issue with Magit status in multi-root workspaces opening wrong repo.
- Other small fixes

## [0.5.4] - 2020-11-21
- Fixes critical issue with status view when called from files outside repo.

## [0.5.3] - 2020-11-05
- Fixes issue with rebasing-status failing when rebasing onto detached state.

## [0.5.2] - 2020-11-05
- Fixes issue with untracked files on Windows
- other small fixes

## [0.5.1] - 2020-10-14

- Removes default lineHeight setting for magit language.

This because the VSCode default font size is different between Mac and the other platforms.

To get back the old lineHeight,
add this to your `settings.json`:
```
    "[magit]": {
        "editor.lineHeight": 15
    },
```

## [0.5.0] - 2020-10-12
- Fixes issue where stash list was showing 1 entry even when there are none.

## [0.4.15] - 2020-10-11
- Adds rebase switch for "Pull" (@stevenguh (Steven Guh)
- UI Bugfixes

## [0.4.11] - 2020-10-01
## [0.4.9] - 2020-09-29
## [0.4.8] - 2020-09-29
### Fixed
- Bugfix

## [0.4.7] - 2020-09-28
### Fixed
- Fixed issue where repos were entangled in multi-repo workspaces
- Fixed issue where sub-repos were not discovered by edamagit

## [0.4.6] - 2020-09-23
### Fixed
- Cases where rebase->continue wasn't working
- Sets default configuration renderWhitespace to 'none' for magit editors.
- small bugfixes

## [0.4.5] - 2020-09-06
### Fixed
- Stash detail now shows untracked files
- Fixed stash deletion bug
- small ui improvements

## [0.4.4] - 2020-09-02
### Fixed
- Fixed issue where branch/commit choosing menus wouldnt close.

## [0.4.3] - 2020-09-02
### Added
- Adds very simple multi selection for discard at point
- Adds option-switches interface (only added -n=<number> for logging so far)

### Fixed
- Can now commit when running global electron, as long as `code` is in your path. (#73)
- Minor visual fixes

## [0.4.2] - 2020-08-13
- bugfixes

## [0.4.1] - 2020-08-11

- Adds highlighted refs and tags next to commits, HEAD, etc (@GriffinSchneider Griffin Schneider)
- Adds submodule commands
- Adds copy-buffer-revision command (@stevenguh (Steven Guh))
- bugfixes

## [0.3.0] - 2020-08-04
- Adds magit-copy-section-value (@stevenguh (Steven Guh))
- Support for submodules
- Bugfixes

## [0.2.65] - 2020-07-22
- Fixed issue with wandering cursor in COMMIT_EDITMSG editor.
(thanks @nickcernis (Nick Cernis) and @stevenguh (Steven Guh))

## [0.2.6] - 2020-07-15
- bugfixes

## [0.2.5] - 2020-06-30
- Allows opening edamagit without having a file open
- bugfixes

## [0.2.4] - 2020-06-29
- bugfixes

Co-contributors: Griffin Schneider, Jack Franklin, and Steven Guh

## [0.2.3] - 2020-06-20
- Adds `magit.display-buffer-function` config option allowing you to choose where new buffers will be displayed.
(thanks @GriffinSchneider Griffin Schneider)
- Bugfixes (thanks @stevenguh Steven Guh)

## [0.2.2] - 2020-06-10

- Disables minimap for edamagit by default
- Adds support for VSCodeVim command mode and visual mode

@stevenguh (Steven Guh):
- Adds a lot of logging functionality (graph, refs, decorations, etc)

## [0.2.0] - 2020-06-04
- Multi-selection staging and unstaging of changes
- Fixed help view, it now reflects user keybindings (thank you @stevenguh (Steven Guh) for helping with this)
- bug fixes

## [0.1.9] - 2020-05-20
- Adds single keypress switch enablement (#35)
    E.g. now you can `push --force` with keysequence: `P - f p`

Courtesy of @stevenguh (Steven Guh):
- Automatically fills out name of local when checking out remote branch
- Items in menus now aligned
- Fixed issue with branch inconsistency

## [0.1.8] - 2020-05-16
- Fixes issue where '/' search with VSCodeVim wasn't working (#24)
- Adds syntax highlighting for help view (#24)
- Adds support for codium (#25)
- New logo

Note: keybindings have gotten an update. This might mean that your custom keybindings for removing default ones need to be updated. See VSCodeVim section of README.

## [0.1.7] - 2020-05-13
- Surface level renaming of the extension to 'edamagit'

Courtesy of @roblabla (Robin Lambertz):
- Automatic discovery of vscode binaries on linux and winows
- Support for VSCode Insiders

Courtesy of @angusiguess (Angus Fletcher):
- Fixed issue where interactive rebase didn't include the selected commit itself.

## [0.1.6] - 2020-05-09
- Performance and bugs

## [0.1.5] - 2020-05-03
- Now possible to stage just selected lines from a change
    (Sub-hunk selection for stage/unstage/discard)

- Fixed issue where merging status didn't show all incoming commits

## [0.1.4] - 2020-04-06
- Visiting a change will now place your cursor at the position in the file relative to the magit diff display
- Stash just index

## [0.1.3] - 2020-03-27
- Unpushed/unpulled status for pushRemote (no longer just upstream)
- Stash just worktree
- Directly call file commands from file (e.g Magit Blame File)
- A bunch of bug fixes

## [0.1.2] - 2020-03-23
- Interactive rebasing
- **Changed default top-level keybindings to avoid hijacking CUT shortcut on Linux and Windows**
  
  New defaults are:

  ```
    status = alt+x g
    file popup = alt+x alt+g
    dispatch = alt+x ctrl+g
  ```

- More colors

## [0.1.1] - 2020-03-20
- Reverse-at-point
- Cherry pick --edit
- Bug fixes

## [0.1.0] - 2020-03-18
- Cherry picking
- Reverting
- Git command running (raw commands)
- Git ignoring
- More colors
- Bug fixes

## [0.0.12] - 2020-03-15
- Fixup commits (@zachdaniel Zach Daniel)
- Allow freeform input in more menus
- Bug fixes

## [0.0.11] - 2020-03-13
- bug fix

## [0.0.10] - 2020-03-13
- Opens repo picker when unsure of which repo.

    E.g. invoking 'status' from external file
- No longer requires text editor focus for top level magit keybindings

    i.e. status, file popup, and dispatch bindings
- Small bug fixes

## [0.0.9] - 2020-03-08
- Adds diffing commands
- Fixes issue with discarding remote branches
- Visit ref heads commits from show-ref view

## [0.0.8] - 2020-03-04
- Tag pushing
- Fixes bug with single key-stroke menu navigation

## [0.0.7] - 2020-03-03
- Adds show-refs command
- Apply- and discard-at-point entities in show-ref view
- Worktree create commands

## [0.0.4] - 2020-02-26
- Fixes issue with filename case

## [0.0.3] - 2020-02-24
- Adds stashing switches
- Adds stash "keep index"
