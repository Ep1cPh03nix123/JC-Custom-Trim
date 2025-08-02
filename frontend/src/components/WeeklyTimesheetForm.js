import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyTimesheetForm = ({ employee, timeData = {}, onChange, onSubmit }) => {
  const initialTimeData = daysOfWeek.reduce((acc, day) => {
    acc[day] = { start: '', end: '' };
    return acc;
  }, {});

  const fullTimeData = { ...initialTimeData, ...timeData };

  const getHours = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const diff = ((endTime - startTime) / (1000 * 60 * 60)) - 1; // in hours
    return diff > 0 ? diff : 0;
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const summary = {
      employeeName: employee.name,
      hourlyRate: employee.rate,
      totalHours,
      totalPay: totalHours * employee.rate,
      breakdown: daysOfWeek.map((day) => {
        const { start, end } = fullTimeData[day];
        const hours = getHours(start, end);
        return {
          day,
          start,
          end,
          hours,
        };
      }),
    };

    onSubmit(summary);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Timesheet for {employee.name} (${employee.rate}/hr)</h3>

      {daysOfWeek.map((day) => (
        <div key={day} style={styles.row}>
          <strong>{day}:</strong>
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
          <span>{getHours(fullTimeData[day].start, fullTimeData[day].end)} hrs</span>
        </div>
      ))}

      <div style={styles.summary}>
        <p><strong>Total Hours:</strong> {totalHours.toFixed(2)}</p>
        <p><strong>Total Pay:</strong> ${ (totalHours * employee.rate).toFixed(2) }</p>
      </div>

      <button type="submit">Submit Timesheet</button>
    </form>
  );
};

const styles = {
  form: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    maxWidth: '500px',
    marginTop: '20px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  summary: {
    marginTop: '20px'
  }
};

export default WeeklyTimesheetForm;
