import type { ToolResult } from './result';

export type EncodingMode =
  | 'unicode-encode'
  | 'unicode-decode'
  | 'url-encode'
  | 'url-decode'
  | 'utf16-encode'
  | 'utf16-decode'
  | 'base64-encode'
  | 'base64-decode'
  | 'md5'
  | 'hex-encode'
  | 'hex-decode'
  | 'sha1'
  | 'html-encode'
  | 'html-deep-encode'
  | 'html-to-js'
  | 'gzip-compress'
  | 'string-escape'
  | 'html-decode'
  | 'url-params-parse'
  | 'jwt-decode'
  | 'cookie-format'
  | 'gzip-decompress'
  | 'string-unescape';

export type EncodingOperation = {
  mode: EncodingMode;
  label: string;
};

export const encodeOperations: EncodingOperation[] = [
  { mode: 'unicode-encode', label: 'Unicode编码 (\\u开头)' },
  { mode: 'url-encode', label: 'URL编码 (%开头)' },
  { mode: 'utf16-encode', label: 'UTF16编码 (\\x开头)' },
  { mode: 'base64-encode', label: 'Base64编码' },
  { mode: 'md5', label: 'MD5计算' },
  { mode: 'hex-encode', label: '十六进制编码' },
  { mode: 'sha1', label: 'Sha1加密' },
  { mode: 'html-encode', label: 'HTML普通编码' },
  { mode: 'html-deep-encode', label: 'HTML深度编码' },
  { mode: 'html-to-js', label: 'HTML转JS' },
  { mode: 'gzip-compress', label: 'Gzip压缩' },
  { mode: 'string-escape', label: '字符串转义' }
];

export const decodeOperations: EncodingOperation[] = [
  { mode: 'unicode-decode', label: 'Unicode解码 (\\u开头)' },
  { mode: 'url-decode', label: 'URL解码 (%开头)' },
  { mode: 'utf16-decode', label: 'UTF16解码 (\\x开头)' },
  { mode: 'base64-decode', label: 'Base64解码' },
  { mode: 'hex-decode', label: '十六进制解码' },
  { mode: 'html-decode', label: 'HTML实体解码' },
  { mode: 'url-params-parse', label: 'URL参数解析' },
  { mode: 'jwt-decode', label: 'JWT解码' },
  { mode: 'cookie-format', label: 'Cookie格式化' },
  { mode: 'gzip-decompress', label: 'Gzip解压' },
  { mode: 'string-unescape', label: '字符串去转义' }
];

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const deepHtmlEntities: Record<string, string> = {
  ...htmlEntities,
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const reversedHtmlEntities = Object.fromEntries(
  Object.entries({ ...deepHtmlEntities, '&#x2f;': '/', '&#x60;': '`', '&#x3d;': '=' }).map(
    ([character, entity]) => [entity, character]
  )
);

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(source: string): Uint8Array {
  const binary = atob(source);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64(source: string): string {
  return bytesToBase64(new TextEncoder().encode(source));
}

function decodeBase64(source: string): string {
  return new TextDecoder().decode(base64ToBytes(source));
}

function encodeUnicode(source: string): string {
  return Array.from(source)
    .map((character) =>
      character
        .codePointAt(0)!
        .toString(16)
        .padStart(4, '0')
        .replace(/^(.{4})$/, '\\u$1')
    )
    .join('');
}

function decodeUnicode(source: string): string {
  return source.replace(/\\u\{([a-fA-F0-9]+)\}|\\u([a-fA-F0-9]{4})/g, (_, braced, plain) =>
    String.fromCodePoint(Number.parseInt(braced ?? plain, 16))
  );
}

function encodeUtf16(source: string): string {
  return Array.from(new TextEncoder().encode(source))
    .map((byte) => `\\x${byte.toString(16).padStart(2, '0')}`)
    .join('');
}

function decodeUtf16(source: string): string {
  const bytes = source.match(/\\x[a-fA-F0-9]{2}/g);
  if (!bytes) {
    throw new Error('Input does not contain \\x byte escapes');
  }
  return new TextDecoder().decode(Uint8Array.from(bytes.map((byte) => Number.parseInt(byte.slice(2), 16))));
}

function encodeHex(source: string): string {
  return Array.from(new TextEncoder().encode(source))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function decodeHex(source: string): string {
  const normalized = source.replace(/\s+/g, '');
  if (!normalized || normalized.length % 2 !== 0 || /[^a-fA-F0-9]/.test(normalized)) {
    throw new Error('Input must be an even-length hexadecimal string');
  }
  return new TextDecoder().decode(
    Uint8Array.from(normalized.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)))
  );
}

function encodeHtml(source: string, deep = false): string {
  const entities = deep ? deepHtmlEntities : htmlEntities;
  return source.replace(deep ? /[&<>"'\/`=]/g : /[&<>"']/g, (character) => entities[character]);
}

function decodeHtml(source: string): string {
  return source.replace(/&(amp|lt|gt|quot|#39|#x2F|#x2f|#x60|#x3D|#x3d);/g, (entity) => {
    const normalized = entity.replace('#x2F', '#x2f').replace('#x3D', '#x3d');
    return reversedHtmlEntities[normalized] ?? entity;
  });
}

function htmlToJs(source: string): string {
  return source
    .split(/\r?\n/)
    .map((line) => `document.writeln(${JSON.stringify(line)});`)
    .join('\n');
}

function escapeString(source: string): string {
  return source
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

function unescapeString(source: string): string {
  return source
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

async function hash(source: string, algorithm: 'SHA-1' | 'MD5'): Promise<string> {
  if (algorithm === 'MD5') {
    return md5(source);
  }
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function leftRotate(value: number, amount: number): number {
  return (value << amount) | (value >>> (32 - amount));
}

function md5(source: string): string {
  const bytes = Array.from(new TextEncoder().encode(source));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }
  for (let index = 0; index < 8; index += 1) {
    bytes.push(Math.floor(bitLength / 2 ** (8 * index)) & 0xff);
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  const constants = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32)
  );

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 16 }, (_, index) => {
      const start = offset + index * 4;
      return (
        bytes[start] |
        (bytes[start + 1] << 8) |
        (bytes[start + 2] << 16) |
        (bytes[start + 3] << 24)
      );
    });
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index += 1) {
      let f = 0;
      let g = 0;
      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + constants[index] + words[g]) | 0, shifts[index])) | 0;
      a = temp;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  return [a0, b0, c0, d0]
    .flatMap((word) => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff])
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function parseUrlParams(source: string): string {
  const query = source.includes('?') ? source.slice(source.indexOf('?') + 1) : source;
  const params = new URLSearchParams(query);
  return JSON.stringify(Object.fromEntries(params.entries()), null, 2);
}

function decodeJwt(source: string): string {
  const [header, payload] = source.split('.');
  if (!header || !payload) {
    throw new Error('JWT must contain header and payload');
  }
  return JSON.stringify(
    {
      header: JSON.parse(decodeBase64Url(header)),
      payload: JSON.parse(decodeBase64Url(payload))
    },
    null,
    2
  );
}

function decodeBase64Url(source: string): string {
  const padded = source.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(source.length / 4) * 4, '=');
  return decodeBase64(padded);
}

function formatCookie(source: string): string {
  const entries = source
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      return separator === -1 ? [part, ''] : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
    });
  return JSON.stringify(Object.fromEntries(entries), null, 2);
}

async function gzipCompress(source: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Gzip compression is not supported in this browser');
  }
  const stream = new Blob([source]).stream().pipeThrough(new CompressionStream('gzip'));
  return bytesToBase64(new Uint8Array(await new Response(stream).arrayBuffer()));
}

async function gzipDecompress(source: string): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Gzip decompression is not supported in this browser');
  }
  const bytes = base64ToBytes(source);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}

export async function convertEncoding(source: string, mode: EncodingMode): Promise<ToolResult<string>> {
  try {
    switch (mode) {
      case 'unicode-encode':
        return { ok: true, value: encodeUnicode(source) };
      case 'unicode-decode':
        return { ok: true, value: decodeUnicode(source) };
      case 'url-encode':
        return { ok: true, value: encodeURIComponent(source) };
      case 'url-decode':
        return { ok: true, value: decodeURIComponent(source) };
      case 'utf16-encode':
        return { ok: true, value: encodeUtf16(source) };
      case 'utf16-decode':
        return { ok: true, value: decodeUtf16(source) };
      case 'base64-encode':
        return { ok: true, value: encodeBase64(source) };
      case 'base64-decode':
        return { ok: true, value: decodeBase64(source) };
      case 'md5':
        return { ok: true, value: await hash(source, 'MD5') };
      case 'hex-encode':
        return { ok: true, value: encodeHex(source) };
      case 'hex-decode':
        return { ok: true, value: decodeHex(source) };
      case 'sha1':
        return { ok: true, value: await hash(source, 'SHA-1') };
      case 'html-encode':
        return { ok: true, value: encodeHtml(source) };
      case 'html-deep-encode':
        return { ok: true, value: encodeHtml(source, true) };
      case 'html-to-js':
        return { ok: true, value: htmlToJs(source) };
      case 'gzip-compress':
        return { ok: true, value: await gzipCompress(source) };
      case 'string-escape':
        return { ok: true, value: escapeString(source) };
      case 'html-decode':
        return { ok: true, value: decodeHtml(source) };
      case 'url-params-parse':
        return { ok: true, value: parseUrlParams(source) };
      case 'jwt-decode':
        return { ok: true, value: decodeJwt(source) };
      case 'cookie-format':
        return { ok: true, value: formatCookie(source) };
      case 'gzip-decompress':
        return { ok: true, value: await gzipDecompress(source) };
      case 'string-unescape':
        return { ok: true, value: unescapeString(source) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown conversion error';
    return { ok: false, error: `Unable to decode or encode input: ${message}` };
  }
}
