import React, { useMemo } from 'react';
import { fmtHours, getHoursWithFlags } from '../utils/TimeHelpers';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const TimesheetSummary = ({ employees = [], timesheets = {}, weekStartISO }) => {
  const lines = useMemo(() => {
    const weekStartDate = new Date(weekStartISO);

    return daysOfWeek.map((day, idx) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + idx);

      // Format as MM/DD/YY (e.g., 08/28/25)
      const prettyDay = d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      });

      // Group by (possibly rounded) hours for this day (exclude 0)
      const groups = new Map(); // key: hours string -> { count, paySum }
      employees.forEach((emp) => {
        const ts = timesheets[emp.id] || {};
        const { start = '', end = '', addLunchBack = false, round = false } = ts[day] || {};
        const hrs = getHoursWithFlags(start, end, addLunchBack, round);
        if (hrs > 0) {
          const key = fmtHours(hrs); // normalized display like '9' or '9.5'
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
  }, [employees, timesheets, weekStartISO]);

  // Weekly total & date range label (MM/DD/YY - MM/DD/YY)
  const { weeklyTotal, weekRangeLabel } = useMemo(() => {
    const total = lines.reduce((sum, l) => sum + l.dayTotalPay, 0);

    const start = new Date(weekStartISO);
    const end = new Date(weekStartISO);
    end.setDate(start.getDate() + 6);

    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

    return {
      weeklyTotal: total,
      weekRangeLabel: `${fmt(start)} - ${fmt(end)}`
    };
  }, [lines, weekStartISO]);

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
        <div><strong>{`Total (${weekRangeLabel}):`}</strong></div>
        <div><strong>{`$${weeklyTotal.toFixed(2)}`}</strong></div>
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
