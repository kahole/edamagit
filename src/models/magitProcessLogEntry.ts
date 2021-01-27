
export interface MagitProcessLogEntry {
  index: number;
  command: string[];
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}