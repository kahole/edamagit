## BUGS TODO MINOR FUTURE

  Bug#2
  After commiting, sometimes another magit status window is next to the existing one.
  - How to reproduce?

  Bug#3
  Section model is responsible for too much
  Must fix. Fine for deciding what section something is. But changes and hunks should use another enum, because it isnt one-to-one between them

# USE magit $ to track what commands magit use for different operations

## General
  - Go for MVP consisting of 90% of common use
  - plus all convenient features that come along with it

## TODO: fold management. What should be folded at the start?
https://github.com/microsoft/vscode/issues/37682
editor.fold
editor.foldRecursively
```
editor.fold with arguments (1, 'up', arrayOfLinesToFold). arrayOfLinesToFold consists of the first line of each range to fold.
```

- start by folding all? then unfold the relevant bits? or opposite

FIRST TIME OPENING: default fold levels

- All of head i guess
- Changes should show first level: modified, new file, etc
- Stash zero levels
- Recent commits zero levels

## FUTURE: Eie egen modell
Burde ikke extende git modellen kanskje.
Burde heller lene meg på helt egen model
med mappere i mellom?

## wow, inject repo and stuff?
@command('git.refresh', { repository: true })

https://github.com/microsoft/vscode/blob/master/extensions/git/src/commands.ts

## DIFF view
  - can use VSCODE diff command to show diff for a file? or something

## Workspaces
  - Needs to support multiple workspaces (Already do this somewhat)
  - Find out how to deal with status views and other views
  - Dispose of stuff when quit workspace etc..

## Main menu
  Alle views i magit støtter hovedmenyen
   Burde være DocumentView som sendes rundt!
   Alle disse trenger update når det skjer noe uansett.
   Dog forskjellig update, e.g magit Log state
   Finn ut av multiplexingen her

## UI
  - icons
        https://code.visualstudio.com/api/references/icons-in-labels
        e.g $(git-branch)

## Dispose

  - Proper use of dispose()
    https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/#disposables

    "This applies to event listening, commands, interacting with the UI, and various language contributions."

## Notes
  - Test on every platform

  - Licensing
      o Magit name trademark? vscodemagit / Magit for VSCode / VSCodeMagit
      o 100% gi credit Magit ofc
      o GPL2/3, MIT, etc
      o git.d.ts microsoft licence, effects?

  - VsVim?
    Maybe.. Is it possible to disable VSVim for certain languages / file extensions / etc?

-----

# magit README

Inspired by (Magit)[https://magit.vc/] for Emacs

## Github sponsor skru på donasjoner på github?

------

## Features

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------