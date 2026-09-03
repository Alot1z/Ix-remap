/** Harness row read from hosts.ts (cfg/skill still `~`-unexpanded). */
export interface HarnessRow {
  id: string;
  label: string;
  bin: string;
  cfg: string;
  skill: string;
}

export function readHarnesses(
  hostsPath?: string,
): { rows: HarnessRow[]; warnings: string[] };

export function binOnPath(bin: string): boolean;

export function resolveToolscan(): { cmd: string; args: string[] } | null;

export function runToolscanOnce(
  resolve?: () => { cmd: string; args: string[] } | null,
): Set<string> | null;

export function probePresent(
  row: HarnessRow,
  deps?: {
    toolscanNames?: Set<string> | null;
    binOnPath?: (bin: string) => boolean;
    exists?: (path: string) => boolean;
  },
): boolean;

export function main(argv?: string[]): void;