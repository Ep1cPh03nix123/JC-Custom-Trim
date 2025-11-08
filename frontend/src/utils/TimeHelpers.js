/** Parse "HH:mm" into a Date on 1970-01-01 */
export const parseTime = (t) => (t ? new Date(`1970-01-01T${t}:00`) : null);

/** Format hours as integer if whole, else one decimal */
export const fmtHours = (h) =>
  Number.isInteger(h) ? `${h}` : `${(+h).toFixed(1)}`;

/** Format time to drop leading zero (e.g., "07:30" -> "7:30") */
export const fmtTime = (t) => (t ? t.replace(/^0/, '') : '');

/** Rounding: keep .5 exact; <.5 down; >.5 up */
export const applyRounding = (val) => {
  const base = Math.floor(val);
  const frac = +(val - base).toFixed(2); // avoid floating point issues
  
  //If time is .1, .2, round down
  if (frac === 0) return base;

  //If time is .3, .4, round to .5
  if (frac <= 0.2) return base;

  //If time is .5, keep as is
  if (frac <= 0.4) return base + 0.5;

  //If time is .6, .7, round to .5
  if (frac <= 0.7) return base + 0.5;

  //If time is .8, .9, round up
  if (frac <= 0.9) return base + 1;
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

/** Build local YYYY-MM-DD string (no UTC conversion) */
export const toLocalISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse 'YYYY-MM-DD' as a LOCAL date (avoid UTC parsing) */
export const fromLocalISO = (iso) => {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Put at midday to avoid DST boundary weirdness
  date.setHours(12, 0, 0, 0);
  return date;
};

/** Get local-ISO for Monday of the week containing date d (avoid UTC drift) */
export const getMondayISO = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(12, 0, 0, 0);
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return toLocalISO(date);
};
