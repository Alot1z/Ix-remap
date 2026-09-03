# Harness smoke fixture

This fixture is intentionally small and offline. It is consumed by the
`harness-install-smoke` CI job through `HARNESS_HOSTS_FILE` and
`TOOLSCAN_PATH`.

- `claude` is reported by the fake toolscan output and must be present.
- `codex` and `openclaw` are in the registry but absent from discovery and PATH.
- The fixture HOME starts empty, so no config-directory probe can make an
  absent host look present.
