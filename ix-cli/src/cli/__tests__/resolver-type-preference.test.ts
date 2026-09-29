// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it, vi } from 'vitest';

import { resolveEntityFull } from '../resolve.js';

// Graph reads refuse a directory no workspace covers (workspace_not_mapped),
// and this suite runs from a checkout that is not registered anywhere. It is
// about resolution, not scoping, so the directory counts as mapped here.
vi.mock("../bootstrap.js", async (orig) => ({
  ...(await orig<typeof import("../bootstrap.js")>()),
  resolveWorkspaceId: () => "ws-test",
}));


describe('resolver type preference', () => {
  it('prefers a class declaration over same-named method candidates for PascalCase symbols', async () => {
    const client = {
      async search() {
        return [
          {
            id: 'method-node',
            kind: 'method',
            name: 'RobustSolver',
            provenance: { sourceUri: '/repo/src/RobustSolver.cpp' },
          },
          {
            id: 'class-node',
            kind: 'class',
            name: 'RobustSolver',
            provenance: { sourceUri: '/repo/include/RobustSolver.h' },
          },
        ];
      },
    };

    const result = await resolveEntityFull(client as any, 'RobustSolver', [
      'file',
      'class',
      'object',
      'trait',
      'interface',
      'module',
      'method',
      'function',
    ]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.entity.id).toBe('class-node');
      expect(result.entity.kind).toBe('class');
    }
  });
});
