const { getDatabase } = require("../db/database");

function listIncidents() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, title, severity, status, detected_at, owner, summary
    FROM incidents
    ORDER BY detected_at DESC
  `).all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    detectedAt: row.detected_at,
    owner: row.owner,
    summary: row.summary
  }));
}

module.exports = { listIncidents };
