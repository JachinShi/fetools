import type { JsonValue } from './json';

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export type JsonDiffEntry = {
  path: string;
  type: DiffType;
  left?: JsonValue;
  right?: JsonValue;
};

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEqual(left: JsonValue, right: JsonValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function joinPath(parent: string, key: string): string {
  return parent ? `${parent}.${key}` : key;
}

function joinIndex(parent: string, index: number): string {
  return `${parent}[${index}]`;
}

export function diffJsonValues(
  left: JsonValue,
  right: JsonValue,
  path = ''
): JsonDiffEntry[] {
  if (isEqual(left, right)) {
    return [{ path, type: 'unchanged', left, right }];
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    const entries: JsonDiffEntry[] = [];

    for (let index = 0; index < maxLength; index += 1) {
      const childPath = joinIndex(path, index);
      if (index >= left.length) {
        entries.push({ path: childPath, type: 'added', right: right[index] });
      } else if (index >= right.length) {
        entries.push({ path: childPath, type: 'removed', left: left[index] });
      } else {
        entries.push(...diffJsonValues(left[index], right[index], childPath));
      }
    }

    return entries;
  }

  if (isRecord(left) && isRecord(right)) {
    const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
    const entries: JsonDiffEntry[] = [];

    for (const key of keys) {
      const childPath = joinPath(path, key);
      if (!(key in left)) {
        entries.push({ path: childPath, type: 'added', right: right[key] });
      } else if (!(key in right)) {
        entries.push({ path: childPath, type: 'removed', left: left[key] });
      } else {
        entries.push(...diffJsonValues(left[key], right[key], childPath));
      }
    }

    return entries;
  }

  return [{ path, type: 'changed', left, right }];
}
