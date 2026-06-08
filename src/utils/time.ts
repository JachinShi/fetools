import type { ToolResult } from './result';

export type TimestampUnit = 'seconds' | 'milliseconds';

export type DateParts = {
  milliseconds: number;
  seconds: number;
  iso: string;
  localInput: string;
};

export type TimeZoneOption = {
  label: string;
  value: string;
};

const cityNames: Record<string, string> = {
  'Asia/Shanghai': '北京',
  'Asia/Hong_Kong': '香港',
  'Asia/Tokyo': '东京',
  'Asia/Seoul': '首尔',
  'Asia/Singapore': '新加坡',
  'Europe/London': '伦敦',
  'Europe/Paris': '巴黎',
  'America/New_York': '纽约',
  'America/Los_Angeles': '洛杉矶',
  UTC: 'UTC'
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

export function formatInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function getTimeZoneOffset(date: Date, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit'
  }).formatToParts(date);
  const offset = formatted.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  return offset.replace(':00', '');
}

function getCityLabel(timeZone: string): string {
  if (cityNames[timeZone]) {
    return cityNames[timeZone];
  }
  const city = timeZone.split('/').at(-1) ?? timeZone;
  return city.replace(/_/g, ' ');
}

export function buildTimeZoneOptions(date = new Date()): TimeZoneOption[] {
  const supported =
    typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : ['UTC', 'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
  const zones = Array.from(new Set(['UTC', ...supported]));

  return zones
    .map((zone) => ({
      value: zone,
      label: `${getCityLabel(zone)}（${getTimeZoneOffset(date, zone)}）`
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-Hans-CN'));
}
