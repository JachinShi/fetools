import { describe, expect, it } from 'vitest';
import { convertEncoding } from '../src/utils/encoding';

describe('encoding utilities', () => {
  it('encodes and decodes URL text', async () => {
    await expect(convertEncoding('a b=中文', 'url-encode')).resolves.toEqual({
      ok: true,
      value: 'a%20b%3D%E4%B8%AD%E6%96%87'
    });
    await expect(convertEncoding('a%20b%3D%E4%B8%AD%E6%96%87', 'url-decode')).resolves.toEqual({
      ok: true,
      value: 'a b=中文'
    });
  });

  it('encodes and decodes Base64 Unicode text', async () => {
    const encoded = await convertEncoding('FeTools 中文', 'base64-encode');

    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      await expect(convertEncoding(encoded.value, 'base64-decode')).resolves.toEqual({
        ok: true,
        value: 'FeTools 中文'
      });
    }
  });

  it('encodes and decodes HTML entities', async () => {
    await expect(convertEncoding('<span title="x">&</span>', 'html-encode')).resolves.toEqual({
      ok: true,
      value: '&lt;span title=&quot;x&quot;&gt;&amp;&lt;/span&gt;'
    });
    await expect(convertEncoding('&lt;b&gt;Hi&amp;&lt;/b&gt;', 'html-decode')).resolves.toEqual({
      ok: true,
      value: '<b>Hi&</b>'
    });
  });

  it('encodes and decodes unicode and utf16 escapes', async () => {
    await expect(convertEncoding('中A', 'unicode-encode')).resolves.toEqual({
      ok: true,
      value: '\\u4e2d\\u0041'
    });
    await expect(convertEncoding('\\u4e2d\\u0041', 'unicode-decode')).resolves.toEqual({
      ok: true,
      value: '中A'
    });
    await expect(convertEncoding('Az', 'utf16-encode')).resolves.toEqual({
      ok: true,
      value: '\\x41\\x7a'
    });
    await expect(convertEncoding('\\x41\\x7a', 'utf16-decode')).resolves.toEqual({
      ok: true,
      value: 'Az'
    });
  });

  it('encodes and decodes hexadecimal text', async () => {
    await expect(convertEncoding('Hi 中', 'hex-encode')).resolves.toEqual({
      ok: true,
      value: '486920e4b8ad'
    });
    await expect(convertEncoding('486920e4b8ad', 'hex-decode')).resolves.toEqual({
      ok: true,
      value: 'Hi 中'
    });
  });

  it('computes md5 and sha1 hashes', async () => {
    await expect(convertEncoding('abc', 'md5')).resolves.toEqual({
      ok: true,
      value: '900150983cd24fb0d6963f7d28e17f72'
    });
    await expect(convertEncoding('abc', 'sha1')).resolves.toEqual({
      ok: true,
      value: 'a9993e364706816aba3e25717850c26c9cd0d89d'
    });
  });

  it('parses URL params JWT and cookies', async () => {
    await expect(convertEncoding('a=1&b=%E4%B8%AD', 'url-params-parse')).resolves.toEqual({
      ok: true,
      value: '{\n  "a": "1",\n  "b": "中"\n}'
    });

    const jwt = [
      'eyJhbGciOiJIUzI1NiJ9',
      'eyJzdWIiOiIxMjMiLCJuYW1lIjoiRmVUb29scyJ9',
      'signature'
    ].join('.');
    await expect(convertEncoding(jwt, 'jwt-decode')).resolves.toEqual({
      ok: true,
      value: '{\n  "header": {\n    "alg": "HS256"\n  },\n  "payload": {\n    "sub": "123",\n    "name": "FeTools"\n  }\n}'
    });

    await expect(convertEncoding('a=1; token=abc', 'cookie-format')).resolves.toEqual({
      ok: true,
      value: '{\n  "a": "1",\n  "token": "abc"\n}'
    });
  });

  it('escapes and unescapes strings', async () => {
    await expect(convertEncoding('a\n"b"', 'string-escape')).resolves.toEqual({
      ok: true,
      value: 'a\\n\\"b\\"'
    });
    await expect(convertEncoding('a\\n\\"b\\"', 'string-unescape')).resolves.toEqual({
      ok: true,
      value: 'a\n"b"'
    });
  });

  it('returns decode errors without throwing', async () => {
    const result = await convertEncoding('%E0%A4%A', 'url-decode');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Unable to decode');
    }
  });
});
