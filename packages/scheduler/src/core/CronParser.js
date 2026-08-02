/**
 * CronParser — Zero-dependency 5-part cron expression evaluator.
 * Format: minute hour day-of-month month day-of-week
 */
export class CronParser {
  /**
   * Check if a 5-part cron expression matches the given Date and Timezone.
   * @param {string} expression e.g. "0 2 0 0 0" or "every-5-minutes"
   * @param {Date} [date]
   * @param {string|null} [timezone]
   * @returns {boolean}
   */
  static isDue(expression, date = new Date(), timezone = null) {
    if (!expression || typeof expression !== 'string') return false;

    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    const targetDate = timezone ? CronParser.getZonedDate(date, timezone) : date;

    const minute = targetDate.getMinutes();
    const hour = targetDate.getHours();
    const dayOfMonth = targetDate.getDate();
    const month = targetDate.getMonth() + 1; // 1-12
    const dayOfWeek = targetDate.getDay(); // 0-6 (0 = Sunday)

    const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;

    return (
      CronParser.matchField(minExpr, minute, 0, 59) &&
      CronParser.matchField(hourExpr, hour, 0, 23) &&
      CronParser.matchField(domExpr, dayOfMonth, 1, 31) &&
      CronParser.matchField(monthExpr, month, 1, 12) &&
      CronParser.matchField(dowExpr, dayOfWeek, 0, 6, true)
    );
  }

  static matchField(expr, value, min, max, isDow = false) {
    if (expr === '*') return true;

    // Handle comma-separated lists: e.g. "1,15,30"
    if (expr.includes(',')) {
      return expr.split(',').some((sub) => CronParser.matchField(sub.trim(), value, min, max, isDow));
    }

    // Handle step values: e.g. "*/5" or "10-20/2"
    if (expr.includes('/')) {
      const [rangeStr, stepStr] = expr.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) return false;

      let start = min;
      let end = max;

      if (rangeStr !== '*') {
        if (rangeStr.includes('-')) {
          const [s, e] = rangeStr.split('-').map(Number);
          start = s;
          end = e;
        } else {
          start = parseInt(rangeStr, 10);
        }
      }

      if (value < start || value > end) return false;
      return (value - start) % step === 0;
    }

    // Handle ranges: e.g. "1-5"
    if (expr.includes('-')) {
      const [start, end] = expr.split('-').map((v) => parseInt(v, 10));
      if (isNaN(start) || isNaN(end)) return false;

      if (isDow && (start === 7 || end === 7)) {
        const normVal = value === 0 ? 7 : value;
        return normVal >= start && normVal <= end;
      }

      return value >= start && value <= end;
    }

    // Single value
    let target = parseInt(expr, 10);
    if (isNaN(target)) return false;

    if (isDow && target === 7) target = 0; // 7 is Sunday in standard cron

    return value === target;
  }

  static getZonedDate(date, timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      const partsMap = {};
      formatter.formatToParts(date).forEach((p) => {
        if (p.type !== 'literal') partsMap[p.type] = parseInt(p.value, 10);
      });

      const d = new Date(date.getTime());
      d.setFullYear(partsMap.year, partsMap.month - 1, partsMap.day);
      d.setHours(partsMap.hour === 24 ? 0 : partsMap.hour, partsMap.minute, partsMap.second);

      // Day of week in target timezone
      const dowFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' });
      const dowStr = dowFormatter.format(date);
      const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      if (dowMap[dowStr] !== undefined) {
        d.getDay = () => dowMap[dowStr];
      }

      return d;
    } catch {
      return date; // fallback if timezone is invalid
    }
  }
}

export default CronParser;
