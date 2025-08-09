import React, { useMemo } from 'react';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayAbbr = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ---------- Pure helpers (module scope) ---------- */

const parseTime = (t) => (t ? new Date(`1970-01-01T${t}:00`) : null);

const roundWithHalfStay = (val) => {
  const eps = 1e-9;
  const base = Math.floor(val);
  const frac = val - base;
  if (Math.abs(frac - 0.5) < eps) return base + 0.5; // keep .5 exact
  if (frac < 0.5) return base;                       // round down
  return base + 1;                                   // round up
};

const getHoursWithLunch = (start, end) => {
  if (!start || !end) return 0;
  const s = parseTime(start);
  const e = parseTime(end);
  if (!s || !e) return 0;

  let hours = (e - s) / (1000 * 60 * 60);
  if (hours <= 0) return 0;

  // subtract 1 hour lunch if start is before 12:00
  const noon = new Date('1970-01-01T12:00:00');
  if (s < noon) {
    hours = Math.max(0, hours - 1);
  }

  return roundWithHalfStay(hours);
};

const fmtHours = (h) => (Number.isInteger(h) ? `${h}` : `${h.toFixed(1)}`);

/* ------------------------------------------------ */

const TimesheetSummary = ({ employees = [], timesheets = {}, weekStartISO }) => {
  const lines = useMemo(() => {
    const weekStartDate = new Date(weekStartISO);

    return daysOfWeek.map((day, idx) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + idx);
      const prettyDay = `${dayAbbr[idx]} ${d.getDate()}`;

      // Group by exact (rounded) hours for this day (exclude 0)
      const groups = new Map(); // key: hours string -> { count, paySum }
      employees.forEach((emp) => {
        const ts = timesheets[emp.id] || {};
        const { start = '', end = '' } = ts[day] || {};
        const hrs = getHoursWithLunch(start, end);
        if (hrs > 0) {
          const key = fmtHours(hrs); // normalized display key like '9' or '9.5'
          if (!groups.has(key)) groups.set(key, { count: 0, paySum: 0 });
          const entry = groups.get(key);
          entry.count += 1;
          entry.paySum += hrs * (emp.rate ?? 0);
        }
      });

      let segments = [];
      let dayTotalPay = 0;
      for (const [hrsKey, { count, paySum }] of groups.entries()) {
        const menLabel = count === 1 ? '1 man' : `${count} men`;
        segments.push(`${menLabel} @ ${hrsKey} hrs`);
        dayTotalPay += paySum;
      }

      const left =
        segments.length > 0
          ? `${prettyDay} (${segments.join(', ')})`
          : `${prettyDay} (0 men @ 0 hrs)`;

      const right = `$${dayTotalPay.toFixed(2)}`;
      return { left, right, dayTotalPay };
    });
  }, [employees, timesheets, weekStartISO]); // only real deps

  const weeklyTotal = lines.reduce((sum, l) => sum + l.dayTotalPay, 0);

  return (
    <div style={styles.wrapper}>
      <h4 style={{ marginBottom: 8 }}>Team Summary (This Week)</h4>

      <div style={styles.header}>
        <span style={{ fontWeight: 600 }}>Date & Time</span>
        <span style={{ fontWeight: 600 }}>Money pay</span>
      </div>

      {lines.map((line, i) => (
        <div key={i} style={styles.row}>
          <span>{line.left}</span>
          <span>{line.right}</span>
        </div>
      ))}

      <div style={styles.footer}>
        <div><strong>Total:</strong></div>
        <div><strong>${weeklyTotal.toFixed(2)}</strong></div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: 16,
    padding: 12,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    maxWidth: 600,
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    paddingBottom: 8,
    borderBottom: '1px solid #eee',
    marginBottom: 8,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '6px 0',
    borderBottom: '1px dotted #eee',
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    paddingTop: 10,
  },
};

export default TimesheetSummary;
