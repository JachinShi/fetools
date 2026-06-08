import type { ToolResult } from './result';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function parseJson(source: string): ToolResult<JsonValue> {
  try {
    return { ok: true, value: JSON.parse(source) as JsonValue };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { ok: false, error: `Invalid JSON: ${message}` };
  }
}

export function formatJson(source: string): ToolResult<string> {
  const parsed = parseJson(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value, null, 2) };
}

export function compactJson(source: string): ToolResult<string> {
  const parsed = parseJson(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value) };
}
