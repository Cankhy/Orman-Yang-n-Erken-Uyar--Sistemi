const test = require("node:test");
const assert = require("node:assert/strict");
const { scoreHotspot, getRiskBand } = require("../backend/services/riskEngine");

test("critical hotspot should score into critical band", () => {
  const hotspot = {
    temperatureC: 41,
    humidity: 16,
    windKmh: 28,
    vegetationDryness: 92,
    responseMinutes: 24,
    slope: 18,
    fuelLoad: 88,
    watchtowerConfidence: 82
  };

  const scored = scoreHotspot(hotspot);
  assert.equal(scored.riskBand, "critical");
  assert.equal(getRiskBand(scored.score), "critical");
});

test("low intensity hotspot should not exceed medium band", () => {
  const hotspot = {
    temperatureC: 26,
    humidity: 48,
    windKmh: 7,
    vegetationDryness: 30,
    responseMinutes: 8,
    slope: 6,
    fuelLoad: 22,
    watchtowerConfidence: 60
  };

  const scored = scoreHotspot(hotspot);
  assert.ok(["low", "medium"].includes(scored.riskBand));
});
