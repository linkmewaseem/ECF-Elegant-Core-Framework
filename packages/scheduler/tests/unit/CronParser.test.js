import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CronParser } from '../../src/index.js';

describe('@ecfjs/scheduler — CronParser Unit Tests', () => {
  test('Wildcard matching (* * * * *)', () => {
    assert.equal(CronParser.isDue('* * * * *', new Date()), true);
  });

  test('Specific minute and hour matching', () => {
    const d = new Date(2026, 7, 1, 14, 30, 0); // 14:30
    assert.equal(CronParser.isDue('30 14 * * *', d), true);
    assert.equal(CronParser.isDue('00 14 * * *', d), false);
  });

  test('Step expressions (*/5, */15)', () => {
    const d15 = new Date(2026, 7, 1, 10, 15, 0);
    const d17 = new Date(2026, 7, 1, 10, 17, 0);

    assert.equal(CronParser.isDue('*/5 * * * *', d15), true);
    assert.equal(CronParser.isDue('*/15 * * * *', d15), true);
    assert.equal(CronParser.isDue('*/5 * * * *', d17), false);
  });

  test('Day of week matching (Sunday=0, Saturday=6)', () => {
    const sunday = new Date('2026-08-02T12:00:00Z'); // Sunday
    assert.equal(CronParser.isDue('* * * * 0', sunday), true);
    assert.equal(CronParser.isDue('* * * * 1', sunday), false);
  });

  test('Timezone-specific evaluation', () => {
    const d = new Date('2026-08-01T17:00:00Z'); // 17:00 UTC = 22:00 PKT (+5)
    assert.equal(CronParser.isDue('0 22 * * *', d, 'Asia/Karachi'), true);
  });
});
