import { DocumentSelector } from 'vscode';

export const LineSplitterRegex: RegExp = /\r?\n/g;

export const FinalLineBreakRegex: RegExp = /\r?\n$/g;

export const StatusMessageDisplayTimeout: number = 10000;

export const MagitUriScheme: string = 'magit';

export const MagitDocumentSelector: DocumentSelector = { scheme: MagitUriScheme, language: 'magit' };

// Must match the semanticTokenTypes in package.json
export enum SemanticTokenTypes {
  RefName = 'magit-ref-name',
  RemoteRefName = 'magit-remote-ref-name',
  HeadName = 'magit-head-name',
  RemoteHeadName = 'magit-remote-head-name',
  TagName = 'magit-tag-name',
}

export const GitConfigOverrideArgs = ['-c', 'diff.noprefix=false'];