// Named variants. Round 1 changes one thing from `base` each; later rounds
// combine what won on dev.
const DOCS_SITE = /(^|\/)(site|website|guides|demos?|playground|benchmarks?)\//;
const DTS = /\.d\.ts$/;

export const VARIANTS = {
  base: {},
  // tokenizer
  code: { code: true },
  stop: { stop: true },
  min4: { minLen: 4 },
  // query weighting
  qtf: { k3: 1.5 },
  qtf8: { k3: 8 },
  id2: { idW: 2 },
  id3: { idW: 3 },
  id5: { idW: 5 },
  id3p: { idW: 3, idPaths: true },
  // BM25F path field
  path1: { pathW: 1 },
  path2: { pathW: 2 },
  path4: { pathW: 4 },
  path2base: { pathW: 2, pathField: "base" },
  path4base: { pathW: 4, pathField: "base" },
  // length normalisation
  k1_09: { k1: 0.9 },
  k1_15: { k1: 1.5 },
  k1_20: { k1: 2.0 },
  b03: { b: 0.3 },
  b05: { b: 0.5 },
  b09: { b: 0.9 },
  cap3: { lenCap: 3 },
  max100: { maxBytes: 100 * 1024 },
  // file kinds
  nosite: { penalty: (p) => (DOCS_SITE.test(p) ? 0.5 : 1) },
  nodts: { penalty: (p) => (DTS.test(p) ? 0.5 : 1) },
};

const CS = { code: true, stop: true };
Object.assign(VARIANTS, {
  cs: CS,
  cs_q8: { ...CS, k3: 8 },
  cs_id2: { ...CS, idW: 2 },
  cs_id3: { ...CS, idW: 3 },
  cs_q8_id2: { ...CS, k3: 8, idW: 2 },
  cs_site: { ...CS, penalty: VARIANTS.nosite.penalty },
  cs_k15: { ...CS, k1: 1.5 },
  cs_k20: { ...CS, k1: 2.0 },
  cs_big05: { ...CS, bigram: 0.5 },
  cs_big1: { ...CS, bigram: 1 },
  cs_path2base: { ...CS, pathW: 2, pathField: "base" },
  max256: { maxBytes: 256 * 1024 },
  code_big1: { code: true, bigram: 1 },
});

// Round 3: on top of code tokens + stopwords + doc-site penalty.
const CSS = { ...CS, penalty: VARIANTS.nosite.penalty };
const only = (re) => (p) => (re.test(p) ? 0 : 1);
Object.assign(VARIANTS, {
  cs_site0: { ...CS, penalty: only(DOCS_SITE) },
  cs_siteonly: { ...CS, penalty: only(/(^|\/)(site|website)\//) },
  css_id2: { ...CSS, idW: 2 },
  css_id3: { ...CSS, idW: 3 },
  css_q8: { ...CSS, k3: 8 },
  css_q2: { ...CSS, k3: 2 },
  css_k15: { ...CSS, k1: 1.5 },
  css_k10: { ...CSS, k1: 1.0 },
  css_b06: { ...CSS, b: 0.6 },
  css_b09: { ...CSS, b: 0.9 },
  css_big05: { ...CSS, bigram: 0.5 },
});

// The chosen variant, as issue.ts implements it: code tokens, prose
// stopwords, identifier terms x2, and docs-site directories out of the corpus.
Object.assign(VARIANTS, {
  final: { ...CS, idW: 2, exclude: DOCS_SITE },
});

// Ablations of `final`: each leaves one of its four parts out.
Object.assign(VARIANTS, {
  final_nocode: { stop: true, idW: 2, exclude: DOCS_SITE },
  final_nostop: { code: true, idW: 2, exclude: DOCS_SITE },
  final_noid: { ...CS, exclude: DOCS_SITE },
  final_nosite: { ...CS, idW: 2 },
});

// v2, after the coordinator's check against all 382 issues' gold: guides/,
// demo(s)/ and benchmark/ hold files real fixes change, so an exclusion rule
// must hold across the whole dataset's gold, not just dev's. isSourcePath now
// comes from fix/issue-start-picking, whose list was checked against all 932
// gold files; `final2` is `final` with that list in place of DOCS_SITE.
const PICKS_NOISE = /(^|\/)(site|website|docs-site|playground|tests?[_-]config|benchmarks|\.?storybook|e2e|cypress|integration-tests)\//;
Object.assign(VARIANTS, {
  picks_base: { exclude: PICKS_NOISE },
  final2: { ...CS, idW: 2, exclude: PICKS_NOISE },
  final2_nocode: { stop: true, idW: 2, exclude: PICKS_NOISE },
  final2_nostop: { code: true, idW: 2, exclude: PICKS_NOISE },
  final2_noid: { ...CS, exclude: PICKS_NOISE },
});
