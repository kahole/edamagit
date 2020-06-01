import { DocumentSelector, window, ThemeColor } from 'vscode';

export const LineSplitterRegex: RegExp = /\r?\n/g;

export const FinalLineBreakRegex: RegExp = /\r?\n$/g;

export const StatusMessageDisplayTimeout: number = 10000;

export const MagitUriScheme: string = 'magit';

export const MagitDocumentSelector: DocumentSelector = { scheme: MagitUriScheme, language: 'magit' };

export const BranchDecoration = window.createTextEditorDecorationType({
  color: 'rgba(202,212,255,1.0)'
  // color: new ThemeColor('textLink.foreground')
});

export const RemoteBranchDecoration = window.createTextEditorDecorationType({
  color: 'rgba(152,238,152,1.0)'
});

export const ExtensionId: string = 'edamagit';
export const enum ConfigKey {
  HelpKeyConfig = 'helpKeyConfig',
}
