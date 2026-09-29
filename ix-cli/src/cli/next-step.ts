// Copyright 2026 Ix Infrastructure Inc.

/**
 * Hints and next steps, phrased for whoever will act on them.
 *
 * A command's closing advice used to be CLI text everywhere: `ix callers X`,
 * `raise --max-tokens`, `Use --include-tests`. Over MCP the same output reaches
 * an agent that has tools, not a shell: `ix_context` has no `--max-tokens`,
 * `ix_search` had no `--include-tests`, and `ix conflicts` is not a tool at
 * all. Advice the reader cannot run is worse than none, because it reads as
 * the one move left.
 *
 * The MCP runner sets {@link IX_CALLER_ENV} for the duration of every command
 * it runs (in-process and in the child-process runner alike), and every hint
 * generator asks {@link forMcp} which phrasing to produce. CLI output is
 * unchanged: the CLI branch of every helper here returns the exact string the
 * command printed before.
 *
 * Over MCP, a hint from a command in the core toolset may name only core
 * tools (see `IX_MCP_CORE_TOOL_NAMES`), because a core session has nothing
 * else. A command outside the core set is only reachable with `--tools=all`,
 * so its hints may name any tool in that catalog.
 */

/** Set to `mcp` by the MCP runner; unset (or anything else) means a person at a shell. */
export const IX_CALLER_ENV = "IX_CALLER";

/** True while a command's output is being produced for an MCP client. */
export function forMcp(): boolean {
  return process.env[IX_CALLER_ENV] === "mcp";
}

type ArgValue = string | number | boolean | undefined | null;

/**
 * One MCP tool call as a caller would write it: `ix_neighbors symbol=X relation=callers`.
 *
 * Empty arguments are dropped, and a value with whitespace or a quote is
 * JSON-quoted so the call still reads as one token per argument.
 */
export function toolCall(tool: string, args: Record<string, ArgValue> = {}): string {
  const parts = [tool];
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null || value === "") continue;
    const text = String(value);
    parts.push(`${key}=${/[\s"'=]/.test(text) ? JSON.stringify(text) : text}`);
  }
  return parts.join(" ");
}

/** The four edge directions `ix_neighbors` takes, and the CLI command for each. */
export type Relation = "callers" | "callees" | "imports" | "imported_by";

const RELATION_COMMAND: Record<Relation, string> = {
  callers: "callers",
  callees: "callees",
  imports: "imports",
  imported_by: "imported-by",
};

/**
 * Suggestions for the core tools, each in the reader's phrasing.
 *
 * The CLI forms are the strings the commands printed before this module
 * existed; keep them byte-identical so CLI output does not move.
 */
export const suggest = {
  neighbors(symbol: string, relation: Relation, opts: { path?: string } = {}): string {
    return forMcp()
      ? toolCall("ix_neighbors", { symbol, relation, path: opts.path })
      : `ix ${RELATION_COMMAND[relation]} ${symbol}`;
  },
  impact(target: string, opts: { path?: string } = {}): string {
    return forMcp() ? toolCall("ix_impact", { target, path: opts.path }) : `ix impact ${target}`;
  },
  context(target: string, opts: { path?: string } = {}): string {
    return forMcp() ? toolCall("ix_context", { target, path: opts.path }) : `ix context ${target}`;
  },
  read(target: string): string {
    return forMcp() ? toolCall("ix_read", { symbol: target }) : `ix read ${target}`;
  },
};

/**
 * How a caller disambiguates a name that resolved to more than one entity.
 *
 * Every core tool that takes a symbol also takes `pick`, `kind` and `path`
 * (`ix_neighbors`, `ix_read`, `ix_impact`, `ix_context`), so the MCP form can
 * name them without knowing which tool it is inside.
 */
export function disambiguationHint(cli: string): string {
  return forMcp() ? "Pass pick=<n> (1-based), kind=<kind> or path=<file substring> to disambiguate." : cli;
}
