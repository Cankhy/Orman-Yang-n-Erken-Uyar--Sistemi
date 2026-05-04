const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../server");

test("GET /api/health returns ok", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "ok");

  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("GET /api/dashboard returns hydrated payload", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload.hotspots));
  assert.ok(Array.isArray(payload.incidents));
  assert.ok(payload.user);

  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});
