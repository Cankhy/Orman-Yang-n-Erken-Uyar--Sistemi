const assert = require("node:assert/strict");
const { scoreHotspot, getRiskBand } = require("../backend/services/riskEngine");
const { createServer } = require("../server");

async function run() {
  const criticalHotspot = {
    temperatureC: 41,
    humidity: 16,
    windKmh: 28,
    vegetationDryness: 92,
    responseMinutes: 24,
    slope: 18,
    fuelLoad: 88,
    watchtowerConfidence: 82
  };

  const lowHotspot = {
    temperatureC: 26,
    humidity: 48,
    windKmh: 7,
    vegetationDryness: 30,
    responseMinutes: 8,
    slope: 6,
    fuelLoad: 22,
    watchtowerConfidence: 60
  };

  const scoredCritical = scoreHotspot(criticalHotspot);
  const scoredLow = scoreHotspot(lowHotspot);

  assert.equal(scoredCritical.riskBand, "critical");
  assert.equal(getRiskBand(scoredCritical.score), "critical");
  assert.ok(["low", "medium"].includes(scoredLow.riskBand));

  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const healthResponse = await fetch(`http://127.0.0.1:${port}/api/health`);
  const healthPayload = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(healthPayload.status, "ok");

  const dashboardResponse = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
  const dashboardPayload = await dashboardResponse.json();
  assert.equal(dashboardResponse.status, 200);
  assert.ok(Array.isArray(dashboardPayload.hotspots));
  assert.ok(Array.isArray(dashboardPayload.incidents));
  assert.ok(dashboardPayload.user);

  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  console.log("All checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
