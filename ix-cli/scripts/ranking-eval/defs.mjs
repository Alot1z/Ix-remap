// Copyright 2026 Ix Infrastructure Inc.

// A stand-in for `ix search --name-only` with no backend: the definitions of
// a name, found by regex over the snapshot's source files. Only good enough to
// measure the plan's ranking (starting files, then BM25) offline; the graph's
// own resolver is what the CLI uses.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LEADING_NOT_DEF = /\b(return|new|if|while|for|switch|catch|else|await|throw|yield|typeof|case)\b/;

export function defSearch(repo, files) {
  return async (name) => {
    const n = esc(name);
    const pats = [
      [new RegExp(`\\b(class|interface|enum|struct|trait|record|object)\\s+${n}\\b`), (m) => (m[1] === "record" ? "class" : m[1])],
      [new RegExp(`\\btype\\s+${n}\\b\\s*[=<]`), () => "type"],
      [new RegExp(`\\b(?:function\\s*\\*?|def|fun|fn|func)\\s+${n}\\b`), () => "function"],
      [new RegExp(`\\b(?:const|let|var)\\s+${n}\\s*=\\s*(?:async\\s*)?(?:function\\b|\\([^)]*\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)`), () => "function"],
      [new RegExp(`^[ \\t]*((?:[\\w<>\\[\\],.?@]+[ \\t]+)*)${n}[ \\t]*(?:<[^>\\n]*>)?\\([^\\n;]*\\)[^\\n;]*\\{[ \\t]*$`, "m"),
        (m) => (LEADING_NOT_DEF.test(m[1]) ? undefined : "method")],
      [new RegExp(`\\b(?:const|let|var|val|final\\s+[\\w<>\\[\\]]+|static\\s+[\\w<>\\[\\]]+)\\s+${n}\\b`), () => (/^[A-Z0-9_]+$/.test(name) ? "constant" : "variable")],
      [new RegExp(`^${n}\\s*=`, "m"), () => (/^[A-Z0-9_]+$/.test(name) ? "constant" : "variable")],
    ];
    const hits = [];
    for (const path of files) {
      const text = repo.read(path);
      if (!text || !text.includes(name)) continue;
      for (const [re, kindOf] of pats) {
        const m = text.match(re);
        const kind = m && kindOf(m);
        if (kind) {
          hits.push({ id: `${path}#${name}`, name, kind, path });
          break;
        }
      }
    }
    return hits;
  };
}
