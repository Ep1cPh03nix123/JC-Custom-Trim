const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function saveTimesheet(payload) {
  const res = await fetch(`${API_BASE}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function listSavedTimesheets() {
  const res = await fetch(`${API_BASE}/api/timesheets`);
  if (!res.ok) {
    throw new Error('Could not load saved timesheets.');
  }
  return res.json();
}

export async function fetchSavedTimesheet(fileName) {
  const res = await fetch(`${API_BASE}/api/timesheets/${encodeURIComponent(fileName)}`);
  if (!res.ok) {
    throw new Error('Could not load this timesheet.');
  }
  return res.json();
}
