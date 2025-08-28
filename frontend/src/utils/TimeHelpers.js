/** Parse "HH:mm" into a Date on 1970-01-01 */
export const parseTime = (t) => (t ? new Date(`1970-01-01T${t}:00`) : null);

/** Format hours as integer if whole, else one decimal */
export const fmtHours = (h) =>
  Number.isInteger(h) ? `${h}` : `${(+h).toFixed(1)}`;

/** Format time to drop leading zero (e.g., "07:30" -> "7:30") */
export const fmtTime = (t) => (t ? t.replace(/^0/, '') : '');

/** Rounding: keep .5 exact; <.5 down; >.5 up */
export const applyRounding = (val) => {
  const eps = 1e-9;
  const base = Math.floor(val);
  const frac = val - base;
  if (Math.abs(frac - 0.5) < eps) return base + 0.5;
  if (frac < 0.5) return base;
  return base + 1;
};

/**
 * EXACT hours (end - start).
 * - By default subtract 1h lunch; if addLunchBack === true, do NOT subtract.
 * - If round === true, apply rounding rule above.
 */
export const getHoursWithFlags = (start, end, addLunchBack = false, round = false) => {
  if (!start || !end) return 0;
  const s = parseTime(start);
  const e = parseTime(end);
  if (!s || !e) return 0;

  let hours = (e - s) / (1000 * 60 * 60);
  if (hours <= 0) return 0;

  if (!addLunchBack) hours = Math.max(0, hours - 1);
  if (round) hours = applyRounding(hours);

  return hours;
};

/** Get ISO date (YYYY-MM-DD) for Monday of the week containing date d */
export const getMondayISO = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
};
