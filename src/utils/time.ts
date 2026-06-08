import type { ToolResult } from './result';

export type TimestampUnit = 'seconds' | 'milliseconds';

export type DateParts = {
  milliseconds: number;
  seconds: number;
  iso: string;
  localInput: string;
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function toLocalInput(date: Date): string {
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes())
  ].join('');
}

function toDateParts(date: Date): ToolResult<DateParts> {
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid date value' };
  }

  const milliseconds = date.getTime();
  return {
    ok: true,
    value: {
      milliseconds,
      seconds: Math.floor(milliseconds / 1000),
      iso: date.toISOString(),
      localInput: toLocalInput(date)
    }
  };
}

export function timestampToDateParts(
  source: string,
  unit: TimestampUnit
): ToolResult<DateParts> {
  const trimmed = source.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: 'Invalid timestamp: enter an integer value' };
  }

  const numeric = Number(trimmed);
  if (!Number.isSafeInteger(numeric)) {
    return { ok: false, error: 'Invalid timestamp: value is outside the safe integer range' };
  }

  const milliseconds = unit === 'seconds' ? numeric * 1000 : numeric;
  return toDateParts(new Date(milliseconds));
}

export function dateInputToTimestamp(source: string): ToolResult<DateParts> {
  const trimmed = source.trim();
  if (!trimmed) {
    return { ok: false, error: 'Invalid date value: choose a date and time' };
  }

  return toDateParts(new Date(trimmed));
}

export function currentDateParts(now = new Date()): DateParts {
  const parts = toDateParts(now);
  if (!parts.ok) {
    throw new Error(parts.error);
  }
  return parts.value;
}
