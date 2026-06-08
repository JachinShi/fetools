import { describe, expect, it } from 'vitest';
import { diffJsonValues } from '../src/utils/jsonDiff';

describe('json diff utilities', () => {
  it('marks object values as added removed changed and unchanged', () => {
    const diff = diffJsonValues(
      { same: 1, changed: 'old', removed: true },
      { same: 1, changed: 'new', added: null }
    );

    expect(diff).toEqual([
      { path: 'added', type: 'added', right: null },
      { path: 'changed', type: 'changed', left: 'old', right: 'new' },
      { path: 'removed', type: 'removed', left: true },
      { path: 'same', type: 'unchanged', left: 1, right: 1 }
    ]);
  });

  it('uses stable paths for nested arrays and objects', () => {
    const diff = diffJsonValues(
      { user: { roles: ['admin', 'editor'] } },
      { user: { roles: ['admin', 'viewer'] } }
    );

    expect(diff).toContainEqual({
      path: 'user.roles[1]',
      type: 'changed',
      left: 'editor',
      right: 'viewer'
    });
  });
});
