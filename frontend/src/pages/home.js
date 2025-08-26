import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import WeeklyTimesheetForm from '../components/WeeklyTimesheetForm';
import TimesheetSummary from '../components/TimesheetSummary';
import NotebookWeekView from '../components/NotebookWeekView';

const Home = () => {
  const [employees, setEmployees] = useState([]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [timesheets, setTimesheets] = useState({}); // Store timesheet per employee

  const handleAddEmployee = (employee) => {
    setEmployees((prev) => [...prev, employee]);
    setActiveEmployeeId(employee.id); // focus new tab
    setTimesheets((prev) => ({
      ...prev,
      [employee.id]: {}, // initialize empty timesheet
    }));
  };

  const handleTimesheetChange = (employeeId, updatedTimeData) => {
    setTimesheets((prev) => ({
      ...prev,
      [employeeId]: updatedTimeData,
    }));
  };

  const activeEmployee = employees.find((emp) => emp.id === activeEmployeeId);
  const activeTimeData = timesheets[activeEmployeeId] || {};
  const weekStartISO =
    activeTimeData.weekStart || new Date().toISOString().slice(0, 10);

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
            {/* Sticky header for the active employee / week */}
            <div style={styles.stickyHeader}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>{activeEmployee.name}</h2>
                <span style={{ color: '#666' }}>${activeEmployee.rate.toFixed(2)}/hr</span>
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>
                Week starting: <strong>{weekStartISO}</strong>
              </div>
            </div>

            <div style={styles.stack}>
              <div style={styles.card}>
                <WeeklyTimesheetForm
                  employee={activeEmployee}
                  timeData={activeTimeData}
                  onChange={(updated) =>
                    handleTimesheetChange(activeEmployeeId, updated)
                  }
                />
              </div>

              <div style={styles.card}>
                <TimesheetSummary
                  employees={employees}
                  timesheets={timesheets}
                  weekStartISO={weekStartISO}
                />
              </div>

              <div style={styles.card}>
                <NotebookWeekView
                  employees={employees}
                  timesheets={timesheets}
                  weekStartISO={weekStartISO}
                />
              </div>
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
    minHeight: 0, // for proper scrolling children
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
    background: '#ffffff',
    border: '1px solid #e4e7ec',
    borderRadius: 12,
    overflow: 'hidden', // so the sticky header looks clean
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: '#ffffff',
    borderBottom: '1px solid #eef0f3',
    padding: '12px 16px',
  },
  stack: {
    padding: 16,
    display: 'grid',
    gap: 16,
    overflowY: 'auto',
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

export default Home;
