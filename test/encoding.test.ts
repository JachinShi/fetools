import { describe, expect, it } from 'vitest';
import { convertEncoding } from '../src/utils/encoding';

describe('encoding utilities', () => {
  it('encodes and decodes URL text', () => {
    expect(convertEncoding('a b=中文', 'url-encode')).toEqual({
      ok: true,
      value: 'a%20b%3D%E4%B8%AD%E6%96%87'
    });
    expect(convertEncoding('a%20b%3D%E4%B8%AD%E6%96%87', 'url-decode')).toEqual({
      ok: true,
      value: 'a b=中文'
    });
  });

  it('encodes and decodes Base64 Unicode text', () => {
    const encoded = convertEncoding('FeTools 中文', 'base64-encode');

    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      expect(convertEncoding(encoded.value, 'base64-decode')).toEqual({
        ok: true,
        value: 'FeTools 中文'
      });
    }
  });

  it('encodes and decodes HTML entities', () => {
    expect(convertEncoding('<span title="x">&</span>', 'html-encode')).toEqual({
      ok: true,
      value: '&lt;span title=&quot;x&quot;&gt;&amp;&lt;/span&gt;'
    });
    expect(convertEncoding('&lt;b&gt;Hi&amp;&lt;/b&gt;', 'html-decode')).toEqual({
      ok: true,
      value: '<b>Hi&</b>'
    });
  });

  it('returns decode errors without throwing', () => {
    const result = convertEncoding('%E0%A4%A', 'url-decode');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Unable to decode');
    }
  });
});
