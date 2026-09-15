const express = require("express");
const { readAlerts, appendAlert } = require("./store");

const app = express();
app.use(express.json());

// Minimal CORS support so a frontend served from a different origin/port
// (or opened directly as a local file) can call this API.
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const PORT = process.env.PORT || 4000;

/** Health check. */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * Receives an alert. Point sentinel-sdk's webhookNotifier at
 * http://<this-server>/alerts and every SentinelAlert gets stored here.
 */
app.post("/alerts", (req, res) => {
  const alert = req.body;

  if (!alert || typeof alert !== "object" || !alert.kind) {
    return res.status(400).json({ error: "Expected a JSON alert payload with at least a 'kind' field." });
  }

  const stored = appendAlert(alert);
  res.status(201).json(stored);
});

/**
 * Lists stored alerts, most recent first. Optional query params:
 *   ?contract=0x...   filter by contract address
 *   ?kind=TVL_DROP     filter by alert kind
 */
app.get("/alerts", (req, res) => {
  let alerts = readAlerts();

  if (req.query.contract) {
    alerts = alerts.filter((a) => a.contract === req.query.contract);
  }
  if (req.query.kind) {
    alerts = alerts.filter((a) => a.kind === req.query.kind);
  }

  res.json(alerts.slice().reverse());
});

app.listen(PORT, () => {
  console.log(`sentinel-backend listening on http://localhost:${PORT}`);
});
