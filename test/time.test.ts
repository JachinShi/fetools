import { describe, expect, it } from 'vitest';
import {
  buildTimeZoneOptions,
  dateInputToTimestamp,
  formatInTimeZone,
  timestampToDateParts
} from '../src/utils/time';

describe('time utilities', () => {
  it('converts millisecond timestamps to date parts', () => {
    expect(timestampToDateParts('1704067200000', 'milliseconds')).toEqual({
      ok: true,
      value: {
        milliseconds: 1704067200000,
        seconds: 1704067200,
        iso: '2024-01-01T00:00:00.000Z',
        localInput: '2024-01-01T08:00'
      }
    });
  });

  it('converts second timestamps to date parts', () => {
    const result = timestampToDateParts('1704067200', 'seconds');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.milliseconds).toBe(1704067200000);
      expect(result.value.seconds).toBe(1704067200);
      expect(result.value.iso).toBe('2024-01-01T00:00:00.000Z');
    }
  });

  it('converts local datetime input to timestamps', () => {
    expect(dateInputToTimestamp('2024-01-01T08:00')).toEqual({
      ok: true,
      value: {
        milliseconds: 1704067200000,
        seconds: 1704067200,
        iso: '2024-01-01T00:00:00.000Z',
        localInput: '2024-01-01T08:00'
      }
    });
  });

  it('rejects invalid timestamps', () => {
    const result = timestampToDateParts('abc', 'seconds');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid timestamp');
    }
  });

  it('formats dates in a simulated time zone', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    expect(formatInTimeZone(date, 'UTC')).toBe('2024-01-01 00:00:00');
    expect(formatInTimeZone(date, 'Asia/Shanghai')).toBe('2024-01-01 08:00:00');
  });

  it('builds the fixed simulated timezone option list', () => {
    const options = buildTimeZoneOptions();

    expect(options).toHaveLength(23);
    expect(options[0]).toEqual({
      label: '中途岛 (GMT-11)',
      value: 'Pacific/Midway'
    });
    expect(options.at(-1)).toEqual({
      label: '奥克兰 (GMT+12)',
      value: 'Pacific/Auckland'
    });
    expect(options).toContainEqual({
      label: '北京 (GMT+8)',
      value: 'Asia/Shanghai'
    });
  });
});
