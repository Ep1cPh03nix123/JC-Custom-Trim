import React, { useMemo } from 'react';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayAbbr = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const TimesheetSummary = ({ employees = [], timesheets = {}, weekStartISO }) => {
  const weekStartDate = useMemo(() => new Date(weekStartISO), [weekStartISO]);

  const getHours = (start, end) => {
    if (!start || !end) return 0;
    const a = new Date(`1970-01-01T${start}:00`);
    const b = new Date(`1970-01-01T${end}:00`);
    const diff = (b - a) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  };

  const lines = useMemo(() => {
    return daysOfWeek.map((day, idx) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + idx);
      const prettyDay = `${dayAbbr[idx]} ${d.getDate()}`;

      // Group by exact hours for this day (exclude 0)
      const groups = new Map(); // key: hours string -> { count, paySum }
      employees.forEach((emp) => {
        const ts = timesheets[emp.id] || {};
        const { start = '', end = '' } = ts[day] || {};
        const hrs = getHours(start, end);
        if (hrs > 0) {
          const key = hrs.toFixed(2); // normalize
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
        const hrsNum = Number(hrsKey);
        const hrsText = Number.isInteger(hrsNum) ? `${hrsNum}` : hrsNum.toFixed(2);
        segments.push(`${menLabel} @ ${hrsText} hrs`);
        dayTotalPay += paySum;
      }

      const left =
        segments.length > 0
          ? `${prettyDay} (${segments.join(', ')})`
          : `${prettyDay} (0 men @ 0 hrs)`;

      const right = `$${dayTotalPay.toFixed(2)}`;
      return { left, right, dayTotalPay };
    });
  }, [employees, timesheets, weekStartDate]);

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
