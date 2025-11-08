import React, { useMemo } from 'react';
import { fmtHours, getHoursWithFlags, toLocalISO, fromLocalISO } from '../utils/TimeHelpers';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const TimesheetSummary = ({ employees = [], timesheets = {}, weekStartISO }) => {
  // Detect if any employee is using custom mode
  const isAnyCustom = employees.some(e => (timesheets[e.id] || {}).mode === 'custom');

  const lines = useMemo(() => {
    if (!isAnyCustom) {
      // Weekly: start from LOCAL parsed Monday, not UTC
      const weekStartDate = fromLocalISO(weekStartISO);

      return daysOfWeek.map((day, idx) => {
        const d = new Date(weekStartDate);
        d.setDate(weekStartDate.getDate() + idx);

        const prettyDay = d.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
        });

        const groups = new Map();
        employees.forEach((emp) => {
          const ts = timesheets[emp.id] || {};
          const { start = '', end = '', addLunchBack = false, round = false } = ts[day] || {};
          const hrs = getHoursWithFlags(start, end, addLunchBack, round);
          if (hrs > 0) {
            const key = fmtHours(hrs);
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
        return { left, right, dayTotalPay, date: toLocalISO(d) };
      });
    }

    // Custom mode: union all LOCAL dates and format from LOCAL parsing
    const dateSet = new Set();
    employees.forEach(emp => {
      const td = timesheets[emp.id] || {};
      if (td.mode === 'custom' && Array.isArray(td.customDays)) {
        td.customDays.forEach(r => { if (r.date) dateSet.add(r.date); });
      }
    });

    const dates = Array.from(dateSet).sort();
    return dates.map(dateISO => {
      const d = fromLocalISO(dateISO);
      const prettyDay = d.toLocaleDateString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
      });

      const groups = new Map();
      employees.forEach(emp => {
        const td = timesheets[emp.id] || {};
        if (td.mode === 'custom' && Array.isArray(td.customDays)) {
          td.customDays
            .filter(r => r.date === dateISO)
            .forEach(r => {
              const hrs = getHoursWithFlags(r.start, r.end, r.addLunchBack, r.round);
              if (hrs > 0) {
                const key = fmtHours(hrs);
                if (!groups.has(key)) groups.set(key, { count: 0, paySum: 0 });
                const entry = groups.get(key);
                entry.count += 1;
                entry.paySum += hrs * (emp.rate ?? 0);
              }
            });
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
      return { left, right, dayTotalPay, date: dateISO };
    });
  }, [employees, timesheets, weekStartISO, isAnyCustom]);

  const { weeklyTotal, weekRangeLabel } = useMemo(() => {
    const total = lines.reduce((sum, l) => sum + l.dayTotalPay, 0);

    if (lines.length === 0) {
      return { weeklyTotal: total, weekRangeLabel: '' };
    }

    // Range label: weekly uses provided week; custom derives from min/max date in lines
    const allDates = lines.map(l => l.date).filter(Boolean).sort();
    const startISO = allDates[0];
    const endISO = allDates[allDates.length - 1];

    const fmt = (iso) =>
      fromLocalISO(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

    return {
      weeklyTotal: total,
      weekRangeLabel: `${fmt(startISO)} - ${fmt(endISO)}`
    };
  }, [lines]);

  return (
    <div style={styles.wrapper}>
      <h4 style={{ marginBottom: 8 }}>Team Summary (This {isAnyCustom ? 'Span' : 'Week'})</h4>

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
        <div><strong>{`Total (${weekRangeLabel}):`}</strong></div>
        <div><strong>{`$${weeklyTotal.toFixed(2)}`}</strong></div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: 'auto',
    marginBottom: 'auto',
    padding: 12,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    maxWidth: '700px',
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
