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

const simulatedTimeZones: TimeZoneOption[] = [
  { label: '中途岛 (GMT-11)', value: 'Pacific/Midway' },
  { label: '阿达克 (GMT-10)', value: 'America/Adak' },
  { label: '夏威夷 (GMT-10)', value: 'Pacific/Honolulu' },
  { label: '安克雷奇 (GMT-9)', value: 'America/Anchorage' },
  { label: '洛杉矶 (GMT-8)', value: 'America/Los_Angeles' },
  { label: '丹佛 (GMT-7)', value: 'America/Denver' },
  { label: '芝加哥 (GMT-6)', value: 'America/Chicago' },
  { label: '纽约 (GMT-5)', value: 'America/New_York' },
  { label: '哈利法克斯 (GMT-4)', value: 'America/Halifax' },
  { label: '布宜诺斯艾利斯 (GMT-3)', value: 'America/Argentina/Buenos_Aires' },
  { label: '亚速尔群岛 (GMT-1)', value: 'Atlantic/Azores' },
  { label: '伦敦 (GMT+0)', value: 'Europe/London' },
  { label: '柏林 (GMT+1)', value: 'Europe/Berlin' },
  { label: '雅典 (GMT+2)', value: 'Europe/Athens' },
  { label: '莫斯科 (GMT+3)', value: 'Europe/Moscow' },
  { label: '迪拜 (GMT+4)', value: 'Asia/Dubai' },
  { label: '卡拉奇 (GMT+5)', value: 'Asia/Karachi' },
  { label: '达卡 (GMT+6)', value: 'Asia/Dhaka' },
  { label: '曼谷 (GMT+7)', value: 'Asia/Bangkok' },
  { label: '北京 (GMT+8)', value: 'Asia/Shanghai' },
  { label: '东京 (GMT+9)', value: 'Asia/Tokyo' },
  { label: '悉尼 (GMT+10)', value: 'Australia/Sydney' },
  { label: '奥克兰 (GMT+12)', value: 'Pacific/Auckland' }
];

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

export function buildTimeZoneOptions(): TimeZoneOption[] {
  return simulatedTimeZones;
}
