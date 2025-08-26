// src/components/NotebookWeekView.js
import React, { useMemo } from 'react';

// ----- shared constants
const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayAbbr = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ---------- Pure helpers (same rules as your app now) ---------- */
const parseTime = (t) => (t ? new Date(`1970-01-01T${t}:00`) : null);

// Show as int if whole, otherwise one decimal (e.g., 9, 9.5)
const fmtHours = (h) => (Number.isInteger(h) ? `${h}` : `${(+h).toFixed(1)}`);
const fmtTime  = (t) => (t ? t.replace(/^0/, '') : ''); // simple 07:30 -> 7:30

// EXACT hours: (end - start). Default subtract 1h lunch.
// If addLunchBack === true → do NOT subtract (i.e., add lunch back).
const getHoursWithLunchFlag = (start, end, addLunchBack = false) => {
  if (!start || !end) return 0;
  const s = parseTime(start);
  const e = parseTime(end);
  if (!s || !e) return 0;

  let hours = (e - s) / (1000 * 60 * 60); // exact hours
  if (hours <= 0) return 0;

  if (!addLunchBack) {
    hours = Math.max(0, hours - 1);
  }
  return hours;
};
/* --------------------------------------------------------------- */

const NotebookWeekView = ({ employees = [], timesheets = {}, weekStartISO }) => {
  const weekStartDate = useMemo(() => new Date(weekStartISO), [weekStartISO]);

  // Build per-day rows and per-employee weekly totals
  const { dayBlocks, perEmployeeTotals } = useMemo(() => {
    // per-employee accumulator
    const empTotals = new Map(); // id -> { name, rate, hours }

    const blocks = daysOfWeek.map((day, idx) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + idx);
      const title = `${dayAbbr[idx]} ${d.getMonth() + 1}/${d.getDate()}/${(d.getFullYear()+'').slice(-2)}`;

      // rows for this day
      const rows = employees.map(emp => {
        const ts = timesheets[emp.id] || {};
        const { start = '', end = '', addLunchBack = false } = ts[day] || {};
        const hours = getHoursWithLunchFlag(start, end, addLunchBack);

        // accumulate weekly total per employee
        if (!empTotals.has(emp.id)) empTotals.set(emp.id, { name: emp.name, rate: emp.rate ?? 0, hours: 0 });
        empTotals.get(emp.id).hours += hours;

        return {
          name: emp.name,
          start,
          end,
          hours,
        };
      }).filter(r => r.start && r.end); // show only filled rows for the “notebook” feel

      const total = rows.reduce((s, r) => s + r.hours, 0);

      return { title, rows, total };
    });

    return { dayBlocks: blocks, perEmployeeTotals: Array.from(empTotals.values()) };
  }, [employees, timesheets, weekStartDate]);

  const weeklyTotalHours = perEmployeeTotals.reduce((s, e) => s + e.hours, 0);
  const weeklyTotalPay   = perEmployeeTotals.reduce((s, e) => s + e.hours * e.rate, 0);

  return (
    <div style={styles.wrap}>
      {/* Left: notebook-style days */}
      <div style={styles.leftCol}>
        {dayBlocks.map((block, i) => (
          <div key={i} style={styles.dayCard}>
            <div style={styles.dayHeader}>{block.title}</div>

            {block.rows.length === 0 ? (
              <div style={styles.rowEmpty}>— no entries —</div>
            ) : (
              block.rows.map((r, idx) => (
                <div key={idx} style={styles.row}>
                  <div style={styles.colName}>{r.name}</div>
                  <div style={styles.colTime}>
                    {fmtTime(r.start)} – {fmtTime(r.end)}
                  </div>
                  <div style={styles.colHours}>{fmtHours(r.hours)}</div>
                </div>
              ))
            )}

            {/* bracket-ish daily total */}
            <div style={styles.totalRow}>
              <div style={{ flex: 1 }} />
              <div style={styles.totalLabel}>Total</div>
              <div style={styles.totalHours}>{fmtHours(block.total)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: weekly per-employee tallies like your photo */}
      <div style={styles.rightCol}>
        <div style={styles.weekHeader}>Weekly Totals</div>

        {perEmployeeTotals.map((e, i) => (
          <div key={i} style={styles.weekRow}>
            <div style={styles.weekName}>{e.name}</div>
            <div style={styles.weekHours}>{fmtHours(e.hours)}</div>
            <div style={styles.weekPay}>${(e.hours * e.rate).toFixed(2)}</div>
          </div>
        ))}

        <div style={styles.weekFooter}>
          <div style={{ fontWeight: 600 }}>All workers:</div>
          <div style={styles.weekHours}>{fmtHours(weeklyTotalHours)}</div>
          <div style={styles.weekPay}>${weeklyTotalPay.toFixed(2)}</div>
        </div>

        {/* NEW: explicit Total Hours line under "All workers" */}
        <div style={styles.totalHoursLine}>
          <span style={{ fontWeight: 600 }}>Total Hours:</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHours(weeklyTotalHours)}</span>
        </div>
      </div>
    </div>
  );
};

/* -------------------- styles -------------------- */
const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 20,
    marginTop: 16,
  },
  leftCol: {
    display: 'grid',
    gap: 12,
  },
  dayCard: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 12,
  },
  dayHeader: {
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: '1px solid #eee',
    paddingBottom: 6,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 60px',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px dotted #eee',
  },
  rowEmpty: {
    color: '#888',
    fontStyle: 'italic',
    padding: '6px 0',
  },
  colName: { fontWeight: 500 },
  colTime: { color: '#333' },
  colHours: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },

  totalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 60px',
    paddingTop: 6,
  },
  totalLabel: { textAlign: 'right', color: '#555', fontWeight: 600 },
  totalHours: { textAlign: 'right', fontWeight: 700 },

  rightCol: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 12,
    height: 'fit-content',
  },
  weekHeader: {
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: '1px solid #eee',
    paddingBottom: 6,
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 90px',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px dotted #eee',
  },
  weekName: { fontWeight: 500 },
  weekHours: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  weekPay:   { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  weekFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 90px',
    alignItems: 'center',
    paddingTop: 8,
    borderTop: '1px solid #eee',
    marginTop: 6,
  },
  totalHoursLine: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 8,
  },
};

export default NotebookWeekView;
