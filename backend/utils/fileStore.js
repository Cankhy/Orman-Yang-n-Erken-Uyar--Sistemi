const fs = require("fs");
const path = require("path");
const { getEnv } = require("../config/env");

function resolveDataPath(fileName) {
  return path.join(getEnv().DATA_DIR, fileName);
}

function readJson(fileName) {
  const filePath = resolveDataPath(fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(fileName, payload) {
  const filePath = resolveDataPath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

module.exports = { readJson, writeJson, resolveDataPath };
