import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ---------- Pure helpers (module scope) ---------- */

const parseTime = (t) => (t ? new Date(`1970-01-01T${t}:00`) : null);

// Show as int if whole, otherwise one decimal (e.g., 9 or 9.5 or 9.3)
const fmtHours = (h) => (Number.isInteger(h) ? `${h}` : `${(+h).toFixed(1)}`);

// EXACT hours: (end - start). Default subtract 1h lunch.
// If addLunchBack === true → do NOT subtract (i.e., add lunch back).
const getHoursWithLunchFlag = (start, end, addLunchBack = false) => {
  if (!start || !end) return 0;
  const s = parseTime(start);
  const e = parseTime(end);
  if (!s || !e) return 0;

  let hours = (e - s) / (1000 * 60 * 60); // exact hours difference
  if (hours <= 0) return 0;

  if (!addLunchBack) {
    hours = Math.max(0, hours - 1);
  }
  return hours;
};

const getMondayISO = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
};

/* ------------------------------------------------ */

const WeeklyTimesheetForm = ({ employee, timeData = {}, onChange }) => {
  // Default structure (Mon–Sun + weekStart + lunch toggle per day)
  const initialTimeData = daysOfWeek.reduce((acc, day) => {
    acc[day] = { start: '', end: '', addLunchBack: false };
    return acc;
  }, { weekStart: getMondayISO() });

  // Merge any saved data
  const fullTimeData = { ...initialTimeData, ...timeData };
  for (const day of daysOfWeek) {
    const base = fullTimeData[day] || {};
    fullTimeData[day] = {
      start: '',
      end: '',
      addLunchBack: false,
      ...base,
    };
  }

  const totalHours = daysOfWeek.reduce((sum, day) => {
    const { start, end, addLunchBack } = fullTimeData[day];
    return sum + getHoursWithLunchFlag(start, end, addLunchBack);
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

  const handleLunchToggle = (day, checked) => {
    const updated = {
      ...fullTimeData,
      [day]: {
        ...fullTimeData[day],
        addLunchBack: checked,
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
        const { start, end, addLunchBack } = fullTimeData[day];
        const hrs = getHoursWithLunchFlag(start, end, addLunchBack);
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

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={addLunchBack}
                onChange={(e) => handleLunchToggle(day, e.target.checked)}
              />
              Add lunch back
            </label>

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
    maxWidth: '700px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  checkbox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  summary: {
    marginTop: '16px',
    borderTop: '1px solid #eee',
    paddingTop: '10px',
  },
};

export default WeeklyTimesheetForm;
