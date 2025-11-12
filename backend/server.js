const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000; // You can change this if needed

app.use(cors());
app.use(bodyParser.json());

// Load data.json
const DATA_FILE = './data.json';

// Route: get all entries
app.get('/hours', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading file:', err);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

// Route: add a new entry
app.post('/hours', (req, res) => {
  try {
    const newEntry = req.body;
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const json = data ? JSON.parse(data) : [];

    json.push({
      id: Date.now(),
      employee: newEntry.employee,
      hours: newEntry.hours,
      date: new Date().toLocaleDateString()
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(json, null, 2));
    res.status(201).json({ message: 'Entry saved!' });
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
