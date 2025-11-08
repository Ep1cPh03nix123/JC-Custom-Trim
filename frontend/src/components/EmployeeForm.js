// src/components/EmployeeForm.js
import React, { useState } from 'react';

const EmployeeForm = ({ onAddEmployee }) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !rate) {
      alert('Please enter both name and hourly rate');
      return;
    }

    const newEmployee = {
      id: Date.now(), // temporary ID, replace with backend ID later
      name,
      rate: parseFloat(rate),
      timeEntries: [],
    };

    onAddEmployee(newEmployee);
    setName('');
    setRate('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Add Employee</h3>
      <div style={styles.inputGroup}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Hourly Rate ($):</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="20"
          step="0.01"
        />
      </div>
      <button type="submit">Add Employee</button>
    </form>
  );
};

const styles = {
  form: {
    marginBottom: 'auto',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px'
  },
  inputGroup: {
    marginBottom: '10px'
  }
};

export default EmployeeForm;
