const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { getEnv } = require("../config/env");

let database;

function readSeed(fileName) {
  const env = getEnv();
  return JSON.parse(fs.readFileSync(path.join(env.DATA_DIR, fileName), "utf8"));
}

function seedTableCount(db, tableName) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      organization TEXT NOT NULL,
      permissions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      coordinates_json TEXT NOT NULL,
      coverage_km INTEGER NOT NULL,
      crews INTEGER NOT NULL,
      drones INTEGER NOT NULL,
      readiness INTEGER NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hotspots (
      id TEXT PRIMARY KEY,
      region TEXT NOT NULL,
      city TEXT NOT NULL,
      coordinates_json TEXT NOT NULL,
      temperature_c REAL NOT NULL,
      humidity INTEGER NOT NULL,
      wind_kmh INTEGER NOT NULL,
      vegetation_dryness INTEGER NOT NULL,
      response_minutes INTEGER NOT NULL,
      slope INTEGER NOT NULL,
      fuel_load INTEGER NOT NULL,
      watchtower_confidence INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      owner TEXT NOT NULL,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);
}

function seedDatabase(db) {
  if (!seedTableCount(db, "users")) {
    const users = readSeed("users.json");
    const statement = db.prepare(`
      INSERT INTO users (id, name, role, organization, permissions_json)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const user of users) {
      statement.run(
        user.id,
        user.name,
        user.role,
        user.organization,
        JSON.stringify(user.permissions)
      );
    }
  }

  if (!seedTableCount(db, "stations")) {
    const stations = readSeed("stations.json");
    const statement = db.prepare(`
      INSERT INTO stations (id, name, coordinates_json, coverage_km, crews, drones, readiness, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const station of stations) {
      statement.run(
        station.id,
        station.name,
        JSON.stringify(station.coordinates),
        station.coverageKm,
        station.crews,
        station.drones,
        station.readiness,
        station.status
      );
    }
  }

  if (!seedTableCount(db, "hotspots")) {
    const hotspots = readSeed("hotspots.json");
    const statement = db.prepare(`
      INSERT INTO hotspots (
        id, region, city, coordinates_json, temperature_c, humidity, wind_kmh,
        vegetation_dryness, response_minutes, slope, fuel_load, watchtower_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const hotspot of hotspots) {
      statement.run(
        hotspot.id,
        hotspot.region,
        hotspot.city,
        JSON.stringify(hotspot.coordinates),
        hotspot.temperatureC,
        hotspot.humidity,
        hotspot.windKmh,
        hotspot.vegetationDryness,
        hotspot.responseMinutes,
        hotspot.slope,
        hotspot.fuelLoad,
        hotspot.watchtowerConfidence
      );
    }
  }

  if (!seedTableCount(db, "incidents")) {
    const incidents = readSeed("incidents.json");
    const statement = db.prepare(`
      INSERT INTO incidents (id, title, severity, status, detected_at, owner, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const incident of incidents) {
      statement.run(
        incident.id,
        incident.title,
        incident.severity,
        incident.status,
        incident.detectedAt,
        incident.owner,
        incident.summary
      );
    }
  }

  if (!seedTableCount(db, "notifications")) {
    const notifications = readSeed("notifications.json");
    const statement = db.prepare(`
      INSERT INTO notifications (id, channel, recipient, severity, title, sent_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of notifications) {
      statement.run(
        item.id,
        item.channel,
        item.recipient,
        item.severity,
        item.title,
        item.sentAt,
        item.status
      );
    }
  }
}

function getDatabase() {
  if (!database) {
    const env = getEnv();
    const dbPath = path.join(env.DATA_DIR, "..", "wildfire.db");
    database = new DatabaseSync(dbPath);
    initializeSchema(database);
    seedDatabase(database);
  }

  return database;
}

module.exports = { getDatabase };
