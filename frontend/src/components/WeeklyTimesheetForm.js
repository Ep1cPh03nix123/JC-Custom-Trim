import React from 'react';
import { fmtHours, getHoursWithFlags, getMondayISO } from '../utils/TimeHelpers';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyTimesheetForm = ({ employee, timeData = {}, onChange }) => {
  // Default structure (Mon–Sun + weekStart + per-day toggles)
  const initialTimeData = daysOfWeek.reduce((acc, day) => {
    acc[day] = { start: '', end: '', addLunchBack: false, round: false };
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
      round: false,
      ...base,
    };
  }

  const totalHours = daysOfWeek.reduce((sum, day) => {
    const { start, end, addLunchBack, round } = fullTimeData[day];
    return sum + getHoursWithFlags(start, end, addLunchBack, round);
  }, 0);

  const handleChange = (day, field, value) => {
    const updated = {
      ...fullTimeData,
      [day]: { ...fullTimeData[day], [field]: value },
    };
    onChange(updated);
  };

  const handleToggle = (day, field, checked) => {
    const updated = {
      ...fullTimeData,
      [day]: { ...fullTimeData[day], [field]: checked },
    };
    onChange(updated);
  };

  const handleWeekChange = (value) => {
    const chosen = new Date(value);
    const day = chosen.getDay();
    const diff = (day + 6) % 7;
    chosen.setDate(chosen.getDate() - diff);
    const mondayISO = chosen.toISOString().slice(0, 10);
    onChange({ ...fullTimeData, weekStart: mondayISO });
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
        const { start, end, addLunchBack, round } = fullTimeData[day];
        const hrs = getHoursWithFlags(start, end, addLunchBack, round);
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
                onChange={(e) => handleToggle(day, 'addLunchBack', e.target.checked)}
              />
              No Lunch
            </label>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={round}
                onChange={(e) => handleToggle(day, 'round', e.target.checked)}
              />
              Round
            </label>

            <span style={{ marginLeft: 8 }}>{fmtHours(hrs)} hrs</span>
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
