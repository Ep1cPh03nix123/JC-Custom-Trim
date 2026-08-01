import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchSavedTimesheet, listSavedTimesheets } from '../api/timesheets';
import TimesheetSummary from '../components/TimesheetSummary';
import NotebookWeekView from '../components/NotebookWeekView';
import { fromLocalISO, getMondayISO } from '../utils/TimeHelpers';

function weekStartFromPayload(employees, timesheets) {
  for (const emp of employees) {
    const ts = timesheets[emp.id];
    if (ts?.weekStart) return ts.weekStart;
  }

  const dates = [];
  employees.forEach((emp) => {
    const td = timesheets[emp.id] || {};
    if (td.mode === 'custom' && Array.isArray(td.customDays)) {
      td.customDays.forEach((r) => {
        if (r.date) dates.push(r.date);
      });
    }
  });

  if (dates.length > 0) {
    dates.sort();
    return getMondayISO(fromLocalISO(dates[0]));
  }

  return getMondayISO(new Date());
}

const SavedTimesheets = () => {
  const [entries, setEntries] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const data = await listSavedTimesheets();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setListError('Could not reach the server. Is the backend running on port 5000?');
      setEntries([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openTimesheet = async (fileName) => {
    setSelectedFile(fileName);
    setDetail(null);
    setDetailLoading(true);
    setDetailError('');
    try {
      const data = await fetchSavedTimesheet(fileName);
      setDetail(data);
    } catch {
      setDetailError('Failed to load this file.');
    } finally {
      setDetailLoading(false);
    }
  };

  const employees = useMemo(() => detail?.employees ?? [], [detail]);
  const timesheets = useMemo(() => detail?.timesheets ?? {}, [detail]);
  const weekStartISO = useMemo(
    () => (employees.length ? weekStartFromPayload(employees, timesheets) : getMondayISO(new Date())),
    [employees, timesheets]
  );

  const formatSavedAt = (iso) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Saved files</h2>
          <button type="button" onClick={loadList} style={styles.refreshBtn} disabled={listLoading}>
            Refresh
          </button>
        </div>

        {listLoading && <p style={styles.muted}>Loading…</p>}
        {listError && <p style={styles.error}>{listError}</p>}

        {!listLoading && !listError && entries.length === 0 && (
          <p style={styles.muted}>No saved timesheets yet. Use Save Data on the Time Tracker page.</p>
        )}

        <div style={styles.fileList}>
          {entries.map(({ fileName, savedAt }) => (
            <button
              key={fileName}
              type="button"
              onClick={() => openTimesheet(fileName)}
              style={{
                ...styles.fileItem,
                ...(selectedFile === fileName ? styles.fileItemActive : {}),
              }}
            >
              <span style={styles.fileDate}>{formatSavedAt(savedAt)}</span>
              <span style={styles.fileName}>{fileName}</span>
            </button>
          ))}
        </div>
      </aside>

      <main style={styles.main}>
        {!selectedFile && (
          <div style={styles.empty}>
            <h2 style={{ marginTop: 0 }}>Saved Timesheets</h2>
            <p style={styles.muted}>Select a file on the left to view employees, pay summary, and notebook view.</p>
          </div>
        )}

        {selectedFile && detailLoading && <p style={styles.muted}>Loading timesheet…</p>}
        {selectedFile && detailError && <p style={styles.error}>{detailError}</p>}

        {selectedFile && detail && !detailLoading && !detailError && (
          <>
            <header style={styles.detailHeader}>
              <div>
                <h2 style={{ margin: '0 0 4px' }}>
                  {formatSavedAt(entries.find((e) => e.fileName === selectedFile)?.savedAt)}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{selectedFile}</p>
              </div>
              <div style={styles.meta}>
                <span>{employees.length} employee{employees.length === 1 ? '' : 's'}</span>
              </div>
            </header>

            {employees.length === 0 ? (
              <p style={styles.muted}>This file has no employee data.</p>
            ) : (
              <>
                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>Employees</h3>
                  <ul style={styles.empList}>
                    {employees.map((emp) => (
                      <li key={emp.id}>
                        <strong>{emp.name}</strong>
                        <span style={styles.muted}> — ${Number(emp.rate ?? 0).toFixed(2)}/hr</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.card}>
                    <TimesheetSummary
                      employees={employees}
                      timesheets={timesheets}
                      weekStartISO={weekStartISO}
                    />
                  </div>
                </div>

                <div style={styles.card}>
                  <NotebookWeekView
                    employees={employees}
                    timesheets={timesheets}
                    weekStartISO={weekStartISO}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const styles = {
  shell: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    height: '100%',
    background: '#f5f6f8',
    gap: 16,
    padding: 16,
    boxSizing: 'border-box',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 12,
    padding: 12,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  refreshBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e4e7ec',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  },
  fileItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e4e7ec',
    background: '#fff',
    cursor: 'pointer',
  },
  fileItemActive: {
    background: '#e8f0ff',
    borderColor: '#c7dbff',
  },
  fileDate: {
    fontWeight: 600,
    fontSize: 14,
  },
  fileName: {
    fontSize: 11,
    color: '#666',
    wordBreak: 'break-all',
  },
  main: {
    minWidth: 0,
    minHeight: 0,
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 12,
    overflowY: 'auto',
    padding: 16,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #eef0f3',
  },
  meta: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    background: '#fff',
    border: '1px solid #e4e7ec',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: 16,
  },
  empList: {
    margin: 0,
    paddingLeft: 20,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
  },
  empty: {
    display: 'grid',
    placeItems: 'center',
    height: '100%',
    color: '#666',
    textAlign: 'center',
  },
  muted: {
    color: '#666',
  },
  error: {
    color: '#b00020',
  },
};

export default SavedTimesheets;
