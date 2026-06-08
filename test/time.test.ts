import { describe, expect, it } from 'vitest';
import { dateInputToTimestamp, timestampToDateParts } from '../src/utils/time';

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
});
