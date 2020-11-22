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
  TagName = 'magit-tag-name',
}

// Colors
// Maybe dont use custom color
// export const lineAddedBackground = registerColor('magit.lineAdded', { dark: transparent(mergeCurrentHeaderBackground, contentTransparency), light: transparent(mergeCurrentHeaderBackground, contentTransparency), hc: transparent(mergeCurrentHeaderBackground, contentTransparency) }, nls.localize('mergeCurrentContentBackground', 'Current content background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations.'), true);
