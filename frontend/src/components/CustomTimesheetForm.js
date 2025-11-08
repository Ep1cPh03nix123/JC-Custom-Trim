import React from 'react';
import { fmtHours, getHoursWithFlags } from '../utils/TimeHelpers';

const emptyItem = () => ({
  id: Date.now() + Math.random(),
  label: '',
  date: '',
  start: '',
  end: '',
  addLunchBack: false,
  round: false,
});

const CustomTimesheetForm = ({ employee, timeData = {}, onChange }) => {
  const full = {
    mode: 'custom',
    customDays: Array.isArray(timeData.customDays) ? timeData.customDays : [emptyItem()],
  };

  const update = (up) => onChange({ ...full, ...up });

  const addRow = () => {
    update({ customDays: [...full.customDays, emptyItem()] });
  };

  const removeRow = (id) => {
    const next = full.customDays.filter((r) => r.id !== id);
    update({ customDays: next.length ? next : [emptyItem()] });
  };

  const editRow = (id, field, value) => {
    const next = full.customDays.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    update({ customDays: next });
  };

  const toggleRow = (id, field, checked) => {
    const next = full.customDays.map((r) => (r.id === id ? { ...r, [field]: checked } : r));
    update({ customDays: next });
  };

  const totalHours = full.customDays.reduce((sum, r) => {
    return sum + getHoursWithFlags(r.start, r.end, r.addLunchBack, r.round);
  }, 0);

  return (
    <div style={styles.form}>
      <h3>Custom Timesheet for {employee.name} (${employee.rate}/hr)</h3>

      <div style={styles.header}>
        <span style={{ width: 160, fontWeight: 600 }}>Label</span>
        <span style={{ width: 150, fontWeight: 600 }}>Date</span>
        <span style={{ width: 110, fontWeight: 600 }}>Start</span>
        <span style={{ width: 110, fontWeight: 600 }}>End</span>
        <span style={{ width: 110, fontWeight: 600 }}>No Lunch</span>
        <span style={{ width: 90,  fontWeight: 600 }}>Round</span>
        <span style={{ width: 90,  fontWeight: 600, textAlign: 'right' }}>Hours</span>
        <span style={{ width: 80 }} />
      </div>

      {full.customDays.map((row) => {
        const hours = getHoursWithFlags(row.start, row.end, row.addLunchBack, row.round);
        return (
          <div key={row.id} style={styles.row}>
            <input
              style={{ width: 160 }}
              type="text"
              placeholder="e.g., Monday / Job A"
              value={row.label}
              onChange={(e) => editRow(row.id, 'label', e.target.value)}
            />
            <input
              style={{ width: 150 }}
              type="date"
              lang="en-CA"
              value={row.date}
              onChange={(e) => editRow(row.id, 'date', e.target.value)}
            />
            <input
              style={{ width: 110 }}
              type="time"
              value={row.start}
              onChange={(e) => editRow(row.id, 'start', e.target.value)}
            />
            <input
              style={{ width: 110 }}
              type="time"
              value={row.end}
              onChange={(e) => editRow(row.id, 'end', e.target.value)}
            />
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={row.addLunchBack}
                onChange={(e) => toggleRow(row.id, 'addLunchBack', e.target.checked)}
              />
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={row.round}
                onChange={(e) => toggleRow(row.id, 'round', e.target.checked)}
              />
            </label>
            <span style={{ width: 90, textAlign: 'right' }}>{fmtHours(hours)}</span>
            <button style={styles.removeBtn} onClick={() => removeRow(row.id)}>Remove</button>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={addRow}>+ Add Day</button>
      </div>

      <div style={styles.summary}>
        <p><strong>Total Hours:</strong> {fmtHours(totalHours)}</p>
        <p><strong>Total Pay:</strong> ${(totalHours * employee.rate).toFixed(2)}</p>
      </div>
    </div>
  );
};

const styles = {
  form: {
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 8,
    background: '#fff',
  },
  header: {
    display: 'flex',
    gap: 10,
    paddingBottom: 6,
    borderBottom: '1px solid #eee',
    marginBottom: 6,
  },
  row: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px dotted #eee',
    flexWrap: 'wrap',
  },
  checkbox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 110 },
  removeBtn: { background: '#fee', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 10px' },
  summary: { marginTop: 12, borderTop: '1px solid #eee', paddingTop: 8 },
};

export default CustomTimesheetForm;
