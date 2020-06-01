export interface HelpKeyConfig {
    // Popup and dwim commands
    cherryPick: string;
    branch: string;
    commit: string;
    diff: string;
    fetch: string;
    pull: string;
    ignore: string;
    log: string;
    merge: string;
    remote: string;
    push: string;
    rebase: string;
    tag: string;
    revert: string;
    reset: string;
    showRefs: string;
    stash: string;
    run: string;
    worktree: string;
    // Applying changes
    apply: string;
    stage: string;
    stageAll: string;
    unstage: string;
    unstageAll: string;
    reverse: string;
    discard: string;
    // Essential commands
    refresh: string;
    gitProcess: string;
}

export const defaultHelpKeyConfig: HelpKeyConfig = {
    cherryPick: 'a',
    branch: 'b',
    commit: 'c',
    diff: 'd',
    fetch: 'f',
    pull: 'F',
    ignore: 'i',
    log: 'l',
    merge: 'm',
    remote: 'M',
    push: 'P',
    rebase: 'r',
    tag: 't',
    revert: 'V',
    reset: 'X',
    showRefs: 'y',
    stash: 'z',
    run: '!',
    worktree: '%',
    // Applying changes
    apply: 'a',
    stage: 's',
    stageAll: 'S',
    unstage: 'u',
    unstageAll: 'U',
    reverse: 'v',
    discard: 'k',
    // Essential commands
    refresh: 'g',
    gitProcess: '$',
};
