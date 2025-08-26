import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  // Lunch window 12:00–13:00
  const lunchStart = new Date('1970-01-01T12:00:00');
  const lunchEnd   = new Date('1970-01-01T13:00:00');

  // If shift overlaps the lunch window, subtract 1 hr
  if (s < lunchEnd && e > lunchStart) {
    hours = Math.max(0, hours - 1);
  }

  return roundWithHalfStay(hours);
};


const fmtHours = (h) => (Number.isInteger(h) ? `${h}` : `${h.toFixed(1)}`);

const getMondayISO = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
};

/* ------------------------------------------------ */

const WeeklyTimesheetForm = ({ employee, timeData = {}, onChange }) => {
  // Default structure (Mon–Sun + weekStart)
  const initialTimeData = daysOfWeek.reduce((acc, day) => {
    acc[day] = { start: '', end: '' };
    return acc;
  }, { weekStart: getMondayISO() });

  // Merge any saved data
  const fullTimeData = { ...initialTimeData, ...timeData };
  for (const day of daysOfWeek) {
    fullTimeData[day] = { start: '', end: '', ...(fullTimeData[day] || {}) };
  }

  const totalHours = daysOfWeek.reduce((sum, day) => {
    const { start, end } = fullTimeData[day];
    return sum + getHoursWithLunch(start, end);
  }, 0);

  const handleChange = (day, field, value) => {
    const updated = {
      ...fullTimeData,
      [day]: {
        ...fullTimeData[day],
        [field]: value,
      },
    };
    onChange(updated);
  };

  const handleWeekChange = (value) => {
    const chosen = new Date(value);
    const day = chosen.getDay();
    const diff = (day + 6) % 7;
    chosen.setDate(chosen.getDate() - diff);
    const mondayISO = chosen.toISOString().slice(0, 10);

    const updated = { ...fullTimeData, weekStart: mondayISO };
    onChange(updated);
  };

  return (
    <div style={styles.form}>
      <h3>Timesheet for {employee.name} (${employee.rate}/hr)</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Week starting (Mon):</label>
        <input
          type="date"
          value={fullTimeData.weekStart}
          onChange={(e) => handleWeekChange(e.target.value)}
        />
      </div>

      {daysOfWeek.map((day) => {
        const { start, end } = fullTimeData[day];
        const hrs = getHoursWithLunch(start, end);
        return (
          <div key={day} style={styles.row}>
            <strong style={{ width: 90 }}>{day}:</strong>
            <input
              type="time"
              value={start}
              onChange={(e) => handleChange(day, 'start', e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              value={end}
              onChange={(e) => handleChange(day, 'end', e.target.value)}
            />
            <span style={{ marginLeft: 8 }}>
              {fmtHours(hrs)} hrs
            </span>
          </div>
        );
      })}

      <div style={styles.summary}>
        <p><strong>Total Hours:</strong> {fmtHours(totalHours)}</p>
        <p><strong>Total Pay:</strong> ${(totalHours * employee.rate).toFixed(2)}</p>
      </div>
    </div>
  );
};

const styles = {
  form: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    maxWidth: '600px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  summary: {
    marginTop: '16px',
    borderTop: '1px solid #eee',
    paddingTop: '10px',
  },
};

export default WeeklyTimesheetForm;
