const crypto = require("crypto");
const { getDatabase } = require("../db/database");

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    organization: row.organization,
    permissions: JSON.parse(row.permissions_json)
  };
}

function listUsers() {
  const db = getDatabase();
  return db
    .prepare(`
      SELECT id, name, role, organization, permissions_json
      FROM users
      ORDER BY name ASC
    `)
    .all()
    .map(normalizeUser);
}

function getCurrentUser(token) {
  const db = getDatabase();

  if (token) {
    const session = db.prepare(`
      SELECT users.id, users.name, users.role, users.organization, users.permissions_json
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ? AND sessions.expires_at > ?
      LIMIT 1
    `).get(token, new Date().toISOString());

    if (session) return normalizeUser(session);
  }

  const firstUser = db.prepare(`
    SELECT id, name, role, organization, permissions_json
    FROM users
    ORDER BY name ASC
    LIMIT 1
  `).get();

  return normalizeUser(firstUser);
}

function createSession(userId) {
  const db = getDatabase();
  const token = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, createdAt, expiresAt);

  return {
    token,
    createdAt,
    expiresAt,
    user: getCurrentUser(token)
  };
}

module.exports = { listUsers, getCurrentUser, createSession };
