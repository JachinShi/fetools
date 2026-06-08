import type { ToolResult } from './result';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonPath = Array<string | number>;

export function parseJson(source: string): ToolResult<JsonValue> {
  try {
    return { ok: true, value: JSON.parse(source) as JsonValue };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { ok: false, error: `Invalid JSON: ${message}` };
  }
}

function decodeEscapedJsonText(source: string): string {
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch {
    // Fall through to raw escaped text decoding.
  }

  return source.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export function parseJsonInput(source: string): ToolResult<JsonValue> {
  const direct = parseJson(source);
  if (direct.ok) {
    if (typeof direct.value === 'string') {
      const nested = parseJson(direct.value);
      if (nested.ok) {
        return nested;
      }
    }
    return direct;
  }

  const decoded = decodeEscapedJsonText(source);
  if (decoded !== source) {
    const decodedResult = parseJson(decoded);
    if (decodedResult.ok) {
      return decodedResult;
    }
  }

  return direct;
}

export function formatJson(source: string): ToolResult<string> {
  const parsed = parseJsonInput(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value, null, 2) };
}

export function compactJson(source: string): ToolResult<string> {
  const parsed = parseJsonInput(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value) };
}

export function deleteJsonPath(value: JsonValue, path: JsonPath): JsonValue {
  if (path.length === 0) {
    return value;
  }

  const [current, ...rest] = path;

  if (Array.isArray(value)) {
    if (typeof current !== 'number') {
      return value;
    }
    if (rest.length === 0) {
      return value.filter((_, index) => index !== current);
    }
    return value.map((item, index) =>
      index === current ? deleteJsonPath(item, rest) : item
    ) as JsonValue[];
  }

  if (typeof value === 'object' && value !== null && typeof current === 'string') {
    const next = { ...value };
    if (rest.length === 0) {
      delete next[current];
      return next;
    }
    if (current in next) {
      next[current] = deleteJsonPath(next[current], rest);
    }
    return next;
  }

  return value;
}
