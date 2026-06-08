import { describe, expect, it } from 'vitest';
import { compactJson, formatJson, parseJson } from '../src/utils/json';

describe('json utilities', () => {
  it('formats valid JSON with two-space indentation', () => {
    const result = formatJson('{"name":"FeHelper","items":[1,true,null]}');

    expect(result).toEqual({
      ok: true,
      value: '{\n  "name": "FeHelper",\n  "items": [\n    1,\n    true,\n    null\n  ]\n}'
    });
  });

  it('compacts valid JSON to one line', () => {
    const result = compactJson('{\n  "b": 2,\n  "a": 1\n}');

    expect(result).toEqual({ ok: true, value: '{"b":2,"a":1}' });
  });

  it('returns parse errors without throwing', () => {
    const result = parseJson('{ bad json');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON');
    }
  });
});
