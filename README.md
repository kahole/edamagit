## TODO: BUGS (also remember MINOR FUTURE)

  Bug#2
  After commiting, sometimes another magit status window is next to the existing one.
  - How to reproduce? Never happens in debug, or?

## MINOR: Thenables dont work with regular try/catch !

## Feature requests
  Feature#1
    magit-dispatch-popup - from any file
    magit-file-popup
      - Staging
      - Log
      - Blaming
    
    Also, make all commands available so long as there is an active editor.
     This means commands need to be able to handle no VIEW.
     This should really be no extra effort
     Might just need to prime a bit smarter?

## FUTURE: Eie egen modell
Burde ikke extende git modellen kanskje.
Burde heller lene meg på helt egen model
med mappere i mellom?

## FUTURE: injection for repo etc?
@command('magit.branching', { repository: true })
https://github.com/microsoft/vscode/blob/master/extensions/git/src/commands.ts

## Workspaces
  - Needs to support multiple workspaces (Already do this somewhat)
  - Find out how to deal with status views and other views
  - Dispose of stuff when quit workspace etc..

## Dispose
  - Proper use of dispose()
    https://vscode-docs.readthedocs.io/en/stable/extensions/patterns-and-principles/#disposables
    "This applies to event listening, commands, interacting with the UI, and various language contributions."

## Notes
  - Test on all platforms

  - Licensing
      o Magit name trademark? vscodemagit / Magit for VSCode / VSCodeMagit
      o 100% gi credit Magit ofc
      o GPL2/3, MIT, etc
      o git.d.ts microsoft licence, effects?

-----

# RELEASE ALPHA MVP

## Github sponsor skru på donasjoner på github?
https://github.com/sponsors

# Magit for VSCode (alpha)

!alpha: use at own your own risk ??

Inspired by the original (Magit)[https://magit.vc/] for Emacs

# Roadmap

- [ ] Stable v1.0
- [ ] Feature parity with Magit



--------

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