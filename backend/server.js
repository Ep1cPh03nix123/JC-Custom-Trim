import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Folder where we'll save all timesheets
const TIMESHEETS_DIR = path.join(process.cwd(), "Timesheets");

// Make sure the folder exists
fs.mkdirSync(TIMESHEETS_DIR, { recursive: true });

// POST endpoint to save a new timesheet
app.post("/api/save", (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ message: "No data received" });
  }

  // Generate a unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `Timesheet_${timestamp}.json`;

  const filePath = path.join(TIMESHEETS_DIR, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved: ${fileName}`);
    res.json({ message: "Timesheet saved successfully!", file: fileName });
  } catch (err) {
    console.error("Error saving timesheet:", err);
    res.status(500).json({ message: "Failed to save timesheet." });
  }
});

// GET endpoint to list saved files (newest first)
app.get("/api/timesheets", (req, res) => {
  try {
    const files = fs
      .readdirSync(TIMESHEETS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((fileName) => {
        const stat = fs.statSync(path.join(TIMESHEETS_DIR, fileName));
        return { fileName, savedAt: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    res.json(files);
  } catch (err) {
    console.error("Error reading timesheet folder:", err);
    res.status(500).json({ message: "Could not read timesheets." });
  }
});

// GET a single saved timesheet by filename
app.get("/api/timesheets/:fileName", (req, res) => {
  const fileName = path.basename(req.params.fileName);
  if (!fileName.endsWith(".json") || fileName.includes("..")) {
    return res.status(400).json({ message: "Invalid file name." });
  }

  const filePath = path.join(TIMESHEETS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Timesheet not found." });
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    res.json({ fileName, ...data });
  } catch (err) {
    console.error("Error reading timesheet:", err);
    res.status(500).json({ message: "Could not read timesheet." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
