# Copyright 2026 Ix Infrastructure Inc.

"""Fix the dev/test split before any results are looked at.

DEV  = every instance id in the earlier ix-bench runs (tuning allowed).
TEST = 60 instances from the rest, seed 20260930, stratified by language
       (15 per language), scored once at the end.
"""
import json, random, collections, pathlib
EXT = pathlib.Path("/home/ihock/src/ix-bench/results/external")
DEV_FILES = ["polybench_pilot.jsonl", "polybench_v2_first.jsonl", "polybench_v2_heldout.jsonl",
             "polybench_v3_first.jsonl", "polybench_v3_heldout.jsonl", "polybench_v3_fresh.jsonl",
             "from_issue_accept.jsonl"]
dev = set()
for f in DEV_FILES:
    for line in open(EXT / f):
        if line.strip():
            dev.add(json.loads(line)["instance_id"])
dev |= set(json.load(open(EXT / "e2e_instances.json")))
rows = [json.loads(l) for l in open(EXT / "polybench_verified.jsonl")]
ids = {r["instance_id"] for r in rows}
dev &= ids
rest = sorted((r for r in rows if r["instance_id"] not in dev), key=lambda r: r["instance_id"])
by_lang = collections.defaultdict(list)
for r in rest:
    by_lang[r["language"]].append(r["instance_id"])
rng = random.Random(20260930)
test = []
langs = sorted(by_lang)
per = 60 // len(langs)
for lang in langs:
    pool = by_lang[lang]
    test += rng.sample(pool, min(per, len(pool)))
# top up if a language was short
short = 60 - len(test)
if short:
    left = [i for l in langs for i in by_lang[l] if i not in test]
    test += rng.sample(left, short)
json.dump({"seed": 20260930, "dev": sorted(dev), "test": sorted(test)}, open("split.json", "w"), indent=1)
lang = {r["instance_id"]: r["language"] for r in rows}
print("dev", len(dev), collections.Counter(lang[i] for i in dev))
print("rest", len(rest), {l: len(v) for l, v in by_lang.items()})
print("test", len(test), collections.Counter(lang[i] for i in test))
