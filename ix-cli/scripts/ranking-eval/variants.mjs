// Copyright 2026 Ix Infrastructure Inc.

// BM25 variants for the ranking study, one knob at a time. `base` reproduces
// issue.ts's bm25Rank exactly (checked by eval.mjs --check); the rest change
// one thing each, so a gain can be attributed.
import { extractCandidates } from "./baseline-issue.mjs";

const WORD_BASE = /[A-Za-z][A-Za-z0-9]*/g;
const WORD_CODE = /[A-Za-z_][A-Za-z0-9_]*/g;
const PART = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;

// Issue-prose words that say nothing about where the code is. English
// function words, plus the words bug reports are written in.
export const STOPWORDS = new Set((
  "the and for are but not you all any can had her was one our out has him his how its may new now old see "
  + "two way who did get let say she too use about above after again also been before being below between both "
  + "could does doing down during each few from further have having here into just more most much must only other "
  + "over own same should some such than that their them then there these they this those through under until very "
  + "want what when where which while whom why will with would your yours "
  + "bug bugs issue issues expected behavior behaviour actual reproduce reproduction steps version versions "
  + "current currently describe description problem thanks thank please like think seems seem happen happens "
  + "work works working instead because since using used example following sure able still even though"
).split(/\s+/));

/** Tokenizer: `base` is issue.ts's; `code` also keeps a multi-part identifier whole. */
export function tokenize(text, o = {}) {
  const minLen = o.minLen ?? 3;
  const out = [];
  if (!o.code) {
    for (const word of text.match(WORD_BASE) ?? []) {
      const parts = word.match(PART) ?? [word];
      for (const part of parts) if (part.length >= minLen) out.push(part.toLowerCase());
    }
    return out;
  }
  for (const word of text.match(WORD_CODE) ?? []) {
    const parts = word.match(PART) ?? [];
    let n = 0;
    for (const part of parts) {
      n++;
      if (part.length >= minLen) out.push(part.toLowerCase());
    }
    if (o.whole !== false && n >= 2) {
      const whole = word.replace(/_/g, "").toLowerCase();
      if (whole.length >= minLen) out.push(whole);
    }
  }
  return out;
}

function queryWeights(query, o) {
  const toks = tokenize(query, o).filter((t) => !(o.stop && STOPWORDS.has(t)));
  const qtf = new Map();
  for (const t of toks) qtf.set(t, (qtf.get(t) ?? 0) + 1);
  const w = new Map();
  for (const [t, f] of qtf) {
    // BM25's query-term saturation (k3): a word the issue repeats counts more.
    w.set(t, o.k3 ? ((o.k3 + 1) * f) / (o.k3 + f) : 1);
  }
  if (o.bigram) {
    // "save model" in prose asks for `saveModel` / `save_model`, which the
    // code tokenizer keeps whole as `savemodel`.
    const seq = tokenize(query, { minLen: o.minLen });
    for (let i = 0; i + 1 < seq.length; i++) {
      if (STOPWORDS.has(seq[i]) || STOPWORDS.has(seq[i + 1])) continue;
      const t = seq[i] + seq[i + 1];
      if (!w.has(t)) w.set(t, o.bigram);
    }
  }
  if (o.idW && o.idW !== 1) {
    const { paths, identifiers } = extractCandidates(query);
    const idTerms = new Set();
    for (const id of [...identifiers, ...(o.idPaths ? paths : [])]) for (const t of tokenize(id, o)) idTerms.add(t);
    for (const t of idTerms) if (w.has(t)) w.set(t, w.get(t) * o.idW);
  }
  return w;
}

/**
 * Options:
 *  code, whole, minLen   tokenizer
 *  stop                  drop STOPWORDS from the query
 *  k1, b                 BM25
 *  k3                    query term frequency saturation (0: off, as base)
 *  idW, idPaths          weight of query terms from identifiers extractCandidates finds
 *  pathW, pathB, pathField  BM25F path field: weight, length norm, "full" | "base" (0: path is body text, as base)
 *  maxBytes              skip files larger than this (base: 200KB)
 *  lenCap                cap a doc's length at lenCap * avg in normalisation
 *  penalty               (path) => multiplier on the final score
 *  exclude               RegExp: paths left out of the corpus, as isSourcePath would
 */
export function rank(repo, files, query, o = {}) {
  const k1 = o.k1 ?? 1.2;
  const b = o.b ?? 0.75;
  const maxBytes = o.maxBytes ?? 200 * 1024;
  const qw = queryWeights(query, o);
  const terms = [...qw.keys()];
  const wanted = new Set(terms);
  const docs = [];
  for (const path of files) {
    if (o.exclude?.test(path)) continue;
    const text = repo.read(path);
    if (text === undefined || Buffer.byteLength(text, "utf8") > maxBytes) continue;
    const tf = new Map();
    let length;
    let ptf;
    let plen = 0;
    if (!o.pathW) {
      const tokens = tokenize(`${path.replace(/\//g, " ")} ${text}`, o);
      for (const t of tokens) if (wanted.has(t)) tf.set(t, (tf.get(t) ?? 0) + 1);
      length = tokens.length;
    } else {
      const tokens = tokenize(text, o);
      for (const t of tokens) if (wanted.has(t)) tf.set(t, (tf.get(t) ?? 0) + 1);
      length = tokens.length;
      const ptext = o.pathField === "base" ? path.slice(path.lastIndexOf("/") + 1) : path.replace(/\//g, " ");
      const ptoks = tokenize(ptext.replace(/\.[A-Za-z]+$/, ""), o);
      ptf = new Map();
      for (const t of ptoks) if (wanted.has(t)) ptf.set(t, (ptf.get(t) ?? 0) + 1);
      plen = ptoks.length;
    }
    docs.push({ path, tf, ptf, length, plen });
  }
  if (docs.length === 0) return [];
  const n = docs.length;
  let total = 0;
  let ptotal = 0;
  const df = new Map();
  for (const d of docs) {
    total += d.length;
    ptotal += d.plen;
    const seen = new Set(d.tf.keys());
    if (d.ptf) for (const t of d.ptf.keys()) seen.add(t);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = total / n || 1;
  const pavg = ptotal / n || 1;
  const pathB = o.pathB ?? 0.5;
  const out = [];
  for (const d of docs) {
    const len = o.lenCap ? Math.min(d.length, o.lenCap * avg) : d.length;
    const norm = 1 - b + (b * len) / avg;
    const pnorm = 1 - pathB + (pathB * d.plen) / pavg;
    let score = 0;
    for (const t of terms) {
      const f = d.tf.get(t) ?? 0;
      const pf = d.ptf?.get(t) ?? 0;
      if (!f && !pf) continue;
      const dd = df.get(t);
      const idf = Math.log(1 + (n - dd + 0.5) / (dd + 0.5));
      let s;
      if (!o.pathW) {
        s = (f * (k1 + 1)) / (f + k1 * norm);
      } else {
        const tt = f / norm + (o.pathW * pf) / pnorm; // BM25F: fields combined before saturation
        s = (tt * (k1 + 1)) / (tt + k1);
      }
      score += qw.get(t) * idf * s;
    }
    if (o.penalty) score *= o.penalty(d.path);
    if (score > 0) out.push({ path: d.path, score });
  }
  return out.sort((a, c) => c.score - a.score || (a.path < c.path ? -1 : a.path > c.path ? 1 : 0));
}
