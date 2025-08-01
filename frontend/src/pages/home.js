// src/pages/Home.js
import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';

const Home = () => {
  const [employees, setEmployees] = useState([]);

  const handleAddEmployee = (employee) => {
    setEmployees((prev) => [...prev, employee]);
  };

  return (
    <div style={styles.container}>
      <h1>Employee Time Tracker</h1>

      <EmployeeForm onAddEmployee={handleAddEmployee} />

      <div style={styles.section}>
        <h3>Employees:</h3>
        {employees.length === 0 ? (
          <p>No employees added yet.</p>
        ) : (
          <ul>
            {employees.map((emp) => (
              <li key={emp.id}>
                {emp.name} - ${emp.rate.toFixed(2)}/hr
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  section: {
    marginTop: '20px'
  }
};

export default Home;
