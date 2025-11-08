import React, { useMemo } from 'react';
import { fmtHours, fmtTime, getHoursWithFlags, toLocalISO, fromLocalISO } from '../utils/TimeHelpers';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayAbbr = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const NotebookWeekView = ({ employees = [], timesheets = {}, weekStartISO }) => {
  const isAnyCustom = employees.some(e => (timesheets[e.id] || {}).mode === 'custom');
  const weekStartDate = useMemo(() => fromLocalISO(weekStartISO), [weekStartISO]);

  const { dayBlocks, perEmployeeTotals } = useMemo(() => {
    const empTotals = new Map(); // id -> { name, rate, hours }

    const addToTotals = (emp, hours) => {
      if (!empTotals.has(emp.id)) empTotals.set(emp.id, { name: emp.name, rate: emp.rate ?? 0, hours: 0 });
      empTotals.get(emp.id).hours += hours;
    };

    if (!isAnyCustom) {
      // Weekly
      const blocks = daysOfWeek.map((day, idx) => {
        const d = new Date(weekStartDate);
        d.setDate(weekStartDate.getDate() + idx);
        const title = `${dayAbbr[idx]} ${d.getMonth() + 1}/${d.getDate()}/${(d.getFullYear()+'').slice(-2)}`;

        const rows = employees.map(emp => {
          const ts = timesheets[emp.id] || {};
          const { start = '', end = '', addLunchBack = false, round = false } = ts[day] || {};
          const hours = getHoursWithFlags(start, end, addLunchBack, round);
          addToTotals(emp, hours);

          return { name: emp.name, start, end, hours };
        }).filter(r => r.start && r.end);

        const total = rows.reduce((s, r) => s + r.hours, 0);
        return { title, rows, total, dateISO: toLocalISO(d) };
      });

      return { dayBlocks: blocks, perEmployeeTotals: Array.from(empTotals.values()) };
    }

    // Custom
    const dateSet = new Set();
    employees.forEach(emp => {
      const td = timesheets[emp.id] || {};
      if (td.mode === 'custom' && Array.isArray(td.customDays)) {
        td.customDays.forEach(r => { if (r.date) dateSet.add(r.date); });
      }
    });
    const dates = Array.from(dateSet).sort();

    const blocks = dates.map(dateISO => {
      const d = fromLocalISO(dateISO);
      const title = `${(d.getMonth()+1)}/${d.getDate()}/${(d.getFullYear()+'').slice(-2)}`;

      const rows = employees.flatMap(emp => {
        const td = timesheets[emp.id] || {};
        if (td.mode !== 'custom' || !Array.isArray(td.customDays)) return [];
        return td.customDays
          .filter(r => r.date === dateISO)
          .map(r => {
            const hours = getHoursWithFlags(r.start, r.end, r.addLunchBack, r.round);
            addToTotals(emp, hours);
            return { name: emp.name, start: r.start, end: r.end, hours };
          });
      }).filter(r => r.start && r.end);

      const total = rows.reduce((s, r) => s + r.hours, 0);
      return { title, rows, total, dateISO };
    });

    return { dayBlocks: blocks, perEmployeeTotals: Array.from(empTotals.values()) };
  }, [employees, timesheets, weekStartDate, isAnyCustom]);

  const weeklyTotalHours = perEmployeeTotals.reduce((s, e) => s + e.hours, 0);
  const weeklyTotalPay   = perEmployeeTotals.reduce((s, e) => s + e.hours * e.rate, 0);

  return (
    <div style={styles.wrap}>
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

            <div style={styles.totalRow}>
              <div style={{ flex: 1 }} />
              <div style={styles.totalLabel}>Total</div>
              <div style={styles.totalHours}>{fmtHours(block.total)}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.rightCol}>
        <div style={styles.weekHeader}>Totals</div>

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

        <div style={styles.totalHoursLine}>
          <span style={{ fontWeight: 600 }}>Total Hours:</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtHours(weeklyTotalHours)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* styles unchanged from your file */
const styles = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 15,
    margin: 'auto',
  },
  leftCol: { display: 'grid', gap: 12 },
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
  rowEmpty: { color: '#888', fontStyle: 'italic', padding: '6px 0' },
  colName: { fontWeight: 500 },
  colTime: { color: '#333' },
  colHours: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  totalRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 60px', paddingTop: 6 },
  totalLabel: { textAlign: 'right', color: '#555', fontWeight: 600 },
  totalHours: { textAlign: 'right', fontWeight: 700 },
  rightCol: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 18,
    height: 'fit-content',
    width: 'fit-content',
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
  totalHoursLine: { display: 'flex', justifyContent: 'space-between', marginTop: 8 },
};

export default NotebookWeekView;
