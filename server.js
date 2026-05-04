const http = require("http");
const fs = require("fs");
const path = require("path");
const { getEnv } = require("./backend/config/env");
const { buildDashboardPayload } = require("./backend/services/dashboardService");
const { getCurrentUser, listUsers, createSession } = require("./backend/services/userService");
const { listIncidents } = require("./backend/services/incidentService");
const { sendTestAlert } = require("./backend/services/notificationService");

const env = getEnv();
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(error.code === "ENOENT" ? "404 Not Found" : "500 Internal Server Error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    response.end(content);
  });
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function getAuthToken(request) {
  const authHeader = request.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return null;
}

async function handleApi(request, response, pathname) {
  const token = getAuthToken(request);

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, {
      status: "ok",
      app: env.APP_NAME,
      environment: env.NODE_ENV,
      weatherProvider: env.WEATHER_PROVIDER,
      weatherConfigured: env.WEATHER_PROVIDER !== "mock" || Boolean(env.OPENWEATHER_API_KEY),
      alertsConfigured: Boolean(env.ALERT_WEBHOOK_URL),
      timestamp: new Date().toISOString()
    });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/dashboard") {
    const payload = await buildDashboardPayload(env, token);
    sendJson(response, 200, payload);
    return true;
  }

  if (request.method === "GET" && pathname === "/api/incidents") {
    sendJson(response, 200, {
      generatedAt: new Date().toISOString(),
      incidents: listIncidents()
    });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/users") {
    sendJson(response, 200, {
      users: listUsers()
    });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/users/me") {
    sendJson(response, 200, {
      user: getCurrentUser(token)
    });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    try {
      const body = await collectRequestBody(request);
      if (!body.userId) {
        sendJson(response, 400, { error: "userId is required" });
        return true;
      }
      sendJson(response, 200, createSession(body.userId));
    } catch (error) {
      sendJson(response, 400, { error: "Invalid JSON body" });
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/alerts/test") {
    try {
      const body = await collectRequestBody(request);
      const result = await sendTestAlert(body, env);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { error: "Invalid JSON body" });
    }
    return true;
  }

  return false;
}

function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const pathname = decodeURIComponent(url.pathname);

      if (pathname.startsWith("/api/")) {
        const handled = await handleApi(request, response, pathname);
        if (!handled) {
          sendJson(response, 404, { error: "API route not found" });
        }
        return;
      }

      const resolvedPath =
        pathname === "/" ? path.join(ROOT, "index.html") : path.join(ROOT, pathname);

      if (!resolvedPath.startsWith(ROOT)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("403 Forbidden");
        return;
      }

      fs.stat(resolvedPath, (error, stats) => {
        if (!error && stats.isDirectory()) {
          sendFile(path.join(resolvedPath, "index.html"), response);
          return;
        }

        sendFile(resolvedPath, response);
      });
    } catch (error) {
      sendJson(response, 500, {
        error: "Internal server error",
        detail: error.message
      });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(env.PORT, () => {
    console.log(`${env.APP_NAME} running at http://localhost:${env.PORT}`);
  });
}

module.exports = { createServer };
