import { CalendarDate, CFCalendar } from './types';

/**
 * Parses a CF-compliant units string into its components.
 *
 * @param units - The CF units string (e.g., "days since 2000-01-01").
 * @returns An object containing the time unit and reference date.
 *
 * @example
 * ```ts
 * const { unit, ref } = parseCFUnits('days since 2000-01-01');
 * // unit: 'days', ref: '2000-01-01'
 * ```
 */
export function parseCFUnits(units: string) {
  const m = units.match(/(\w+)\s+since\s+(.+)/i);
  if (!m) throw new Error(`Invalid CF units: ${units}`);
  const [, unit, ref] = m;
  return { unit: unit.toLowerCase(), ref };
}

function calendarType(cal: string): string {
  if (['standard', 'gregorian', 'proleptic_gregorian'].includes(cal)) return 'gregorian';
  if (['julian'].includes(cal)) return 'julian';
  if (['noleap', '365_day'].includes(cal)) return 'noleap';
  if (['all_leap', '366_day'].includes(cal)) return 'all_leap';
  if (['360_day'].includes(cal)) return '360_day';
  return 'gregorian';
}

function isLeapGregorian(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function isLeapJulian(y: number): boolean {
  return y % 4 === 0;
}

function monthLengths(year: number, cal: string): number[] {
  const type = calendarType(cal);
  switch (type) {
    case 'gregorian':
      return [31, isLeapGregorian(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    case 'julian':
      return [31, isLeapJulian(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    case 'noleap':
      return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    case 'all_leap':
      return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    case '360_day':
      return Array(12).fill(30);
    default:
      return monthLengths(year, 'gregorian');
  }
}

function addDaysCalendar(refDate: CalendarDate, days: number, calendar: CFCalendar): CalendarDate {
  let { year, month, day, hour, minute, second, microsecond } = refDate;

  const wholeDays = Math.floor(days);
  let frac = days - wholeDays;

  day += wholeDays;

  while (true) {
    const ml = monthLengths(year, calendar)[month - 1];
    if (day <= ml) break;
    day -= ml;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const totalSeconds = frac * 86400;
  const secWhole = Math.floor(totalSeconds);
  const secFrac = totalSeconds - secWhole;

  second += secWhole;
  microsecond += Math.round(secFrac * 1e6);

  minute += Math.floor(second / 60);
  second = second % 60;

  hour += Math.floor(minute / 60);
  minute = minute % 60;

  day += Math.floor(hour / 24);
  hour = hour % 24;

  while (true) {
    const ml = monthLengths(year, calendar)[month - 1];
    if (day <= ml) break;
    day -= ml;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { year, month, day, hour, minute, second, microsecond };
}

function parseRefDate(ref: string): CalendarDate {
  const d = new Date(ref);
  if (isNaN(d.getTime())) throw new Error(`Invalid reference date: ${ref}`);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    microsecond: 0
  };
}

function calendarToISO(c: CalendarDate): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return (
    `${pad(c.year, 4)}-${pad(c.month)}-${pad(c.day)}T` +
    `${pad(c.hour)}:${pad(c.minute)}:${pad(c.second)}Z`
  );
}

/**
 * Decodes CF-compliant time coordinate values into ISO date strings.
 *
 * @param values - Array of numeric time values to decode.
 * @param units - CF time units string (e.g., "days since 2000-01-01").
 * @param calendar - CF calendar type (default is "standard").
 * @returns Array of ISO date strings corresponding to the input time values.
 *
 * @example
 * ```ts
 * const times = decodeCFTime([0, 1, 2], 'days since 2000-01-01', 'standard');
 * // ['2000-01-01T00:00:00Z', '2000-01-02T00:00:00Z', '2000-01-03T00:00:00Z']
 * ```
 */
export function decodeCFTime(
  values: number[],
  units: string,
  calendar: CFCalendar = 'standard'
): string[] {
  const { unit, ref } = parseCFUnits(units);
  const refDate = parseRefDate(ref);
  const scale = {
    seconds: 1 / 86400,
    second: 1 / 86400,
    minutes: 1 / 1440,
    minute: 1 / 1440,
    hours: 1 / 24,
    hour: 1 / 24,
    days: 1,
    day: 1
  }[unit];

  if (!scale) throw new Error(`Unsupported time unit: ${unit}`);

  const cal = calendar.toLowerCase() as CFCalendar;
  const type = calendarType(cal);

  return values.map(v => {
    const days = v * scale;

    if (type === 'gregorian') {
      const d = new Date(ref);
      const offsetMs = days * 86400 * 1000;
      const newTimeMs = d.getTime() + offsetMs;
      const result = new Date(newTimeMs).toISOString();
      return result;
    }

    const newDate = addDaysCalendar(refDate, days, cal);
    return calendarToISO(newDate);
  });
}
