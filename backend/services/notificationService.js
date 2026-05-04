const { getDatabase } = require("../db/database");

function listNotifications() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, channel, recipient, severity, title, sent_at, status
    FROM notifications
    ORDER BY sent_at DESC
    LIMIT 10
  `).all();

  return rows.map((row) => ({
    id: row.id,
    channel: row.channel,
    recipient: row.recipient,
    severity: row.severity,
    title: row.title,
    sentAt: row.sent_at,
    status: row.status
  }));
}

async function sendTestAlert(body, env) {
  const db = getDatabase();
  const latest = db.prepare(`SELECT COUNT(*) AS count FROM notifications`).get().count;
  const entry = {
    id: `NTF-${latest + 1}`,
    channel: body.channel || "webhook",
    recipient: body.recipient || env.ALERT_WEBHOOK_URL || "demo-endpoint",
    severity: body.severity || "high",
    title: body.title || "Test alarmı",
    sentAt: new Date().toISOString(),
    status: env.ALERT_WEBHOOK_URL ? "sent" : "mocked"
  };

  if (env.ALERT_WEBHOOK_URL) {
    try {
      const response = await fetch(env.ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(entry)
      });
      entry.status = response.ok ? "sent" : `webhook-${response.status}`;
    } catch (error) {
      entry.status = "webhook-failed";
    }
  }

  db.prepare(`
    INSERT INTO notifications (id, channel, recipient, severity, title, sent_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id,
    entry.channel,
    entry.recipient,
    entry.severity,
    entry.title,
    entry.sentAt,
    entry.status
  );

  return {
    success: true,
    alert: entry
  };
}

module.exports = { listNotifications, sendTestAlert };
