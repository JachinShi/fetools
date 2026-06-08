import type { ToolResult } from './result';

export type EncodingMode =
  | 'url-encode'
  | 'url-decode'
  | 'base64-encode'
  | 'base64-decode'
  | 'html-encode'
  | 'html-decode';

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const reversedHtmlEntities = Object.fromEntries(
  Object.entries(htmlEntities).map(([character, entity]) => [entity, character])
);

function encodeBase64(source: string): string {
  const bytes = new TextEncoder().encode(source);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(source: string): string {
  const binary = atob(source);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeHtml(source: string): string {
  return source.replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

function decodeHtml(source: string): string {
  return source.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => reversedHtmlEntities[entity]);
}

export function convertEncoding(source: string, mode: EncodingMode): ToolResult<string> {
  try {
    switch (mode) {
      case 'url-encode':
        return { ok: true, value: encodeURIComponent(source) };
      case 'url-decode':
        return { ok: true, value: decodeURIComponent(source) };
      case 'base64-encode':
        return { ok: true, value: encodeBase64(source) };
      case 'base64-decode':
        return { ok: true, value: decodeBase64(source) };
      case 'html-encode':
        return { ok: true, value: encodeHtml(source) };
      case 'html-decode':
        return { ok: true, value: decodeHtml(source) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown conversion error';
    return { ok: false, error: `Unable to decode or encode input: ${message}` };
  }
}
