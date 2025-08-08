import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyTimesheetForm = ({ employee, timeData = {}, onChange }) => {
  // Compute current week's Monday (YYYY-MM-DD)
  const getMondayISO = (d = new Date()) => {
    const date = new Date(d);
    const day = date.getDay(); // 0..6 (Sun..Sat)
    const diff = (day + 6) % 7; // days since Monday
    date.setDate(date.getDate() - diff);
    return date.toISOString().slice(0, 10);
  };

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

  const getHours = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const diff = (endTime - startTime) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0; // ignore negative (no overnight)
  };

  const totalHours = daysOfWeek.reduce((sum, day) => {
    const { start, end } = fullTimeData[day];
    return sum + getHours(start, end);
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

      {daysOfWeek.map((day) => (
        <div key={day} style={styles.row}>
          <strong style={{ width: 90 }}>{day}:</strong>
          <input
            type="time"
            value={fullTimeData[day].start}
            onChange={(e) => handleChange(day, 'start', e.target.value)}
          />
          <span>to</span>
          <input
            type="time"
            value={fullTimeData[day].end}
            onChange={(e) => handleChange(day, 'end', e.target.value)}
          />
          <span style={{ marginLeft: 8 }}>
            {getHours(fullTimeData[day].start, fullTimeData[day].end).toFixed(2)} hrs
          </span>
        </div>
      ))}

      <div style={styles.summary}>
        <p><strong>Total Hours:</strong> {totalHours.toFixed(2)}</p>
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
