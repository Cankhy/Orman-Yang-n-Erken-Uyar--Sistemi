import { hotspots, monitoringStations } from "../data/mockHotspots.js";
import { buildAlerts, buildInsights, buildMethodology, buildStationSummary, buildSystemMetrics, buildTimeline, scoreHotspot, serializeDashboard } from "./riskModel.js";

const AUTH_TOKEN_KEY = "wildfire-auth-token";

function buildLocalPayload() {
  const scoredHotspots = hotspots.map(scoreHotspot).sort((a, b) => b.score - a.score);
  const stations = buildStationSummary(monitoringStations);

  return serializeDashboard({
    metadata: {
      systemMode: "simulation",
      notificationMode: "mock",
      environment: "file",
      weatherSourceStatus: "Yerel veri",
      apiAvailable: false,
      storage: "static"
    },
    user: {
      name: "Demo Kullanıcı",
      role: "Operator",
      organization: "Yerel Demo Oturumu",
      permissions: ["view_dashboard"]
    },
    hotspots: scoredHotspots,
    stations,
    metrics: buildSystemMetrics(scoredHotspots, stations),
    alerts: buildAlerts(scoredHotspots),
    insights: buildInsights(scoredHotspots, stations),
    timeline: buildTimeline(scoredHotspots),
    methodology: buildMethodology(),
    incidents: [
      {
        id: "INC-DEMO",
        title: "Yerel demo olayı",
        severity: "medium",
        status: "observing",
        detectedAt: new Date().toISOString(),
        owner: "Demo Kullanıcı",
        summary: "Sunucu erişimi yokken yerel veriyle çalışan gösterim kaydı."
      }
    ],
    notifications: []
  });
}

export async function getDashboardData() {
  const isHttp = window.location.protocol.startsWith("http");

  if (isHttp) {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch("/api/dashboard", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}
      });
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload.hotspots) && Array.isArray(payload.metrics)) {
          payload.metadata = {
            ...payload.metadata,
            apiAvailable: true
          };
          return payload;
        }
      }
    } catch (error) {
      console.warn("API erişimi başarısız, yerel veri kullanılacak.", error);
    }
  }

  return buildLocalPayload();
}

export async function getUsers() {
  const response = await fetch("/api/users");
  const payload = await response.json();
  return payload.users || [];
}

export async function loginAs(userId) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });
  const payload = await response.json();
  if (payload.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  }
  return payload;
}
