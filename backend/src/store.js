const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "alerts.json");

/** Ensures the data file exists before we try to read/write it. */
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

/** Reads all stored alerts. */
function readAlerts() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Appends one alert and persists the full list back to disk. */
function appendAlert(alert) {
  const alerts = readAlerts();
  const stored = {
    id: alerts.length + 1,
    receivedAt: new Date().toISOString(),
    ...alert,
  };
  alerts.push(stored);
  fs.writeFileSync(DATA_FILE, JSON.stringify(alerts, null, 2), "utf8");
  return stored;
}

module.exports = { readAlerts, appendAlert };
