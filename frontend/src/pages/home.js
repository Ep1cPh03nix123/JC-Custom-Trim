import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import WeeklyTimesheetForm from '../components/WeeklyTimesheetForm';
import TimesheetSummary from '../components/TimesheetSummary';
import NotebookWeekView from '../components/NotebookWeekView';
import CustomTimesheetForm from '../components/CustomTimesheetForm';
import { toLocalISO, getMondayISO } from '../utils/TimeHelpers';

const Home = () => {
  const [employees, setEmployees] = useState([]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [timesheets, setTimesheets] = useState({}); // per-employee timesheet data

  const nowISO = toLocalISO(new Date());

  // Global mode: true if all employees are in custom
  const isCustomGlobal =
    employees.length > 0 &&
    employees.every((e) => (timesheets[e.id] || {}).mode === 'custom');

  const handleAddEmployee = (employee) => {
    setEmployees((prev) => [...prev, employee]);
    setActiveEmployeeId(employee.id);

    setTimesheets((prev) => {
      const customInit = {
        mode: 'custom',
        customDays: [
          {
            id: Date.now(),
            label: '',
            date: nowISO,
            start: '',
            end: '',
            addLunchBack: false,
            round: false,
          },
        ],
      };
      const weeklyInit = {}; // WeeklyTimesheetForm will fill defaults
      return {
        ...prev,
        [employee.id]: isCustomGlobal ? customInit : weeklyInit,
      };
    });
  };

  const handleTimesheetChange = (employeeId, updatedTimeData) => {
    setTimesheets((prev) => ({
      ...prev,
      [employeeId]: updatedTimeData,
    }));
  };

  const activeEmployee = employees.find((emp) => emp.id === activeEmployeeId);
  const activeTimeData = timesheets[activeEmployeeId] || {};
  const weekStartISO = activeTimeData.weekStart || getMondayISO(new Date());

  // GLOBAL mode switch for all employees
  const switchMode = (mode) => {
    if (mode === 'custom') {
      setTimesheets((prev) => {
        const next = { ...prev };
        employees.forEach((emp) => {
          const existing = prev[emp.id] || {};
          if (existing.mode === 'custom' && Array.isArray(existing.customDays)) {
            next[emp.id] = existing; // keep their custom entries
          } else {
            const baseDate = existing.weekStart || nowISO;
            next[emp.id] = {
              mode: 'custom',
              customDays: [
                {
                  id: Date.now() + Math.random(),
                  label: '',
                  date: baseDate,
                  start: '',
                  end: '',
                  addLunchBack: false,
                  round: false,
                },
              ],
            };
          }
        });
        return next;
      });
    } else {
      // switch back to weekly for everyone
      setTimesheets((prev) => {
        const next = { ...prev };
        employees.forEach((emp) => {
          const existing = prev[emp.id] || {};
          const cleaned = { ...existing };
          delete cleaned.mode;
          delete cleaned.customDays;
          if (!cleaned.weekStart) cleaned.weekStart = getMondayISO(new Date());
          next[emp.id] = cleaned;
        });
        return next;
      });
    }
  };

  return (
    <div style={styles.shell}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.appTitle}>Employee Time Tracker</h2>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Add Employee</h3>
          <EmployeeForm onAddEmployee={handleAddEmployee} />
        </div>

        <div style={{ ...styles.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={styles.sectionTitle}>Employees</h3>

          {employees.length === 0 ? (
            <p style={{ color: '#666' }}>No employees added yet.</p>
          ) : (
            <div style={styles.empList}>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setActiveEmployeeId(emp.id)}
                  style={{
                    ...styles.empItem,
                    ...(emp.id === activeEmployeeId ? styles.empItemActive : {}),
                  }}
                  title={`${emp.name} – $${emp.rate.toFixed(2)}/hr`}
                >
                  <span style={{ fontWeight: 600 }}>{emp.name}</span>
                  <span style={{ color: '#555' }}>${emp.rate.toFixed(2)}/hr</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main style={styles.main}>
        {activeEmployee ? (
          <>
            {/* Sticky header */}
            <div style={styles.stickyHeader}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>{activeEmployee.name}</h2>
                <span style={{ color: '#666' }}>${activeEmployee.rate.toFixed(2)}/hr</span>
              </div>

              {/* Global mode toggle */}
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#666', fontSize: 14 }}>Mode:</span>
                <button
                  onClick={() => switchMode('weekly')}
                  style={{ ...btnStyle, ...(isCustomGlobal ? {} : btnActive) }}
                  title="Use Monday–Sunday week view"
                >
                  Weekly
                </button>
                <button
                  onClick={() => switchMode('custom')}
                  style={{ ...btnStyle, ...(isCustomGlobal ? btnActive : {}) }}
                  title="Pick your own dates"
                >
                  Custom
                </button>

                {!isCustomGlobal && (
                  <div style={{ marginLeft: 'auto', color: '#666', fontSize: 14 }}>
                    Week starting: <strong>{weekStartISO}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Two-column row: Timesheet (left) | Team Summary (right) */}
            <div style={styles.twoCol}>
              <div style={styles.card}>
                {isCustomGlobal ? (
                  <CustomTimesheetForm
                    employee={activeEmployee}
                    timeData={timesheets[activeEmployeeId] || {}}
                    onChange={(updated) => handleTimesheetChange(activeEmployeeId, updated)}
                  />
                ) : (
                  <WeeklyTimesheetForm
                    employee={activeEmployee}
                    timeData={timesheets[activeEmployeeId] || {}}
                    onChange={(updated) => handleTimesheetChange(activeEmployeeId, updated)}
                  />
                )}
              </div>

              <div style={{ ...styles.card, padding: 12 }}>
                <TimesheetSummary
                  employees={employees}
                  timesheets={timesheets}
                  weekStartISO={weekStartISO}
                />
              </div>
            </div>

            {/* Notebook view below (full width) */}
            <div style={styles.card}>
              <NotebookWeekView
                employees={employees}
                timesheets={timesheets}
                weekStartISO={weekStartISO}
              />
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <h2>Welcome 👋</h2>
            <p>Add an employee on the left, then click their name to begin entering time.</p>
          </div>
        )}
      </main>
    </div>
  );
};

/* -------------------- layout styles -------------------- */
/* -------------------- layout styles -------------------- */
const styles = {
  shell: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    height: '100vh',
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
  },
  appTitle: {
    margin: '4px 8px 8px',
    fontSize: 20,
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: 16,
  },
  empList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    paddingRight: 4,
  },
  empItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e4e7ec',
    background: '#fff',
    cursor: 'pointer',
  },
  empItemActive: {
    background: '#e8f0ff',
    borderColor: '#c7dbff',
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,          // allow grid child to shrink so it can scroll
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 12,
    overflowY: 'auto',     // make main the scrolling container
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: '#ffffff',
    borderBottom: '1px solid #eef0f3',
    padding: '12px 16px',
  },

  // Two-column layout for Timesheet | Team Summary
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 575px', // left wide, right narrow
    gap: 16,
    padding: 16,
    alignItems: 'start',
  },

  card: {
    background: '#fff',
    border: '1px solid #e4e7ec',
    borderRadius: 10,
    padding: 12,
  },
  emptyState: {
    display: 'grid',
    placeItems: 'center',
    height: '100%',
    color: '#666',
  },
};

// small button style for the mode toggle
const btnStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #e4e7ec',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};
const btnActive = {
  background: '#e8f0ff',
  borderColor: '#c7dbff',
};


export default Home;
