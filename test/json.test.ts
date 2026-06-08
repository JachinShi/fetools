import { describe, expect, it } from 'vitest';
import {
  compactJson,
  deleteJsonPath,
  formatJson,
  parseJson,
  parseJsonInput
} from '../src/utils/json';

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

  it('parses JSON text with escaped quotes', () => {
    const result = parseJsonInput('{\\"name\\":\\"FeHelper\\"}');

    expect(result).toEqual({ ok: true, value: { name: 'FeHelper' } });
  });

  it('parses JSON strings that contain escaped JSON text', () => {
    const result = parseJsonInput('"{\\"name\\":\\"FeHelper\\"}"');

    expect(result).toEqual({ ok: true, value: { name: 'FeHelper' } });
  });

  it('deletes nested object properties immutably', () => {
    const source = { user: { name: 'Ada', age: 36 }, active: true };
    const result = deleteJsonPath(source, ['user', 'age']);

    expect(result).toEqual({ user: { name: 'Ada' }, active: true });
    expect(source).toEqual({ user: { name: 'Ada', age: 36 }, active: true });
  });

  it('deletes array items immutably', () => {
    const source = { items: ['a', 'b', 'c'] };
    const result = deleteJsonPath(source, ['items', 1]);

    expect(result).toEqual({ items: ['a', 'c'] });
    expect(source).toEqual({ items: ['a', 'b', 'c'] });
  });
});
