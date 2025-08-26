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

  return (
    <div style={styles.container}>
      <h1>Employee Time Tracker</h1>

      <EmployeeForm onAddEmployee={handleAddEmployee} />

      <div style={styles.section}>
        <h3>Employees:</h3>
        {employees.length === 0 ? (
          <p>No employees added yet.</p>
        ) : (
          <>
            <div style={styles.tabBar}>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setActiveEmployeeId(emp.id)}
                  style={{
                    ...styles.tab,
                    ...(emp.id === activeEmployeeId ? styles.activeTab : {}),
                  }}
                >
                  {emp.name}
                </button>
              ))}
            </div>

            {activeEmployee && (
              <div style={styles.timesheetBox}>
                <WeeklyTimesheetForm
                  employee={activeEmployee}
                  timeData={activeTimeData}
                  onChange={(updated) =>
                    handleTimesheetChange(activeEmployeeId, updated)
                  }
                />

                {/* Team-wide daily aggregation summary */}
                <TimesheetSummary
                  employees={employees}
                  timesheets={timesheets}
                  weekStartISO={
                  activeTimeData.weekStart || new Date().toISOString().slice(0, 10)
                  }
                />
                {/* NEW: Notebook-style menu like your photo */}
                <NotebookWeekView
                  employees={employees}
                  timesheets={timesheets}
                  weekStartISO={activeTimeData.weekStart || new Date().toISOString().slice(0, 10)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
  },
  section: {
    marginTop: '20px',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 15px',
    backgroundColor: '#ddd',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  activeTab: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  timesheetBox: {
    padding: '15px',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
};

export default Home;
