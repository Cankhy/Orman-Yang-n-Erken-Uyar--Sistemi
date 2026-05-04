const { getDatabase } = require("../db/database");
const { scoreHotspot, summarizeStations, buildMetrics } = require("./riskEngine");
const { getWeatherAdjustment } = require("./weatherProvider");
const { listIncidents } = require("./incidentService");
const { getCurrentUser } = require("./userService");
const { listNotifications } = require("./notificationService");

function readHotspots() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT *
    FROM hotspots
    ORDER BY city ASC, region ASC
  `).all();

  return rows.map((row) => ({
    id: row.id,
    region: row.region,
    city: row.city,
    coordinates: JSON.parse(row.coordinates_json),
    temperatureC: row.temperature_c,
    humidity: row.humidity,
    windKmh: row.wind_kmh,
    vegetationDryness: row.vegetation_dryness,
    responseMinutes: row.response_minutes,
    slope: row.slope,
    fuelLoad: row.fuel_load,
    watchtowerConfidence: row.watchtower_confidence
  }));
}

function readStations() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT *
    FROM stations
    ORDER BY name ASC
  `).all();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    coordinates: JSON.parse(row.coordinates_json),
    coverageKm: row.coverage_km,
    crews: row.crews,
    drones: row.drones,
    readiness: row.readiness,
    status: row.status
  }));
}

function buildAlerts(scoredHotspots) {
  return scoredHotspots
    .filter((item) => item.score >= 60)
    .slice(0, 4)
    .map((item, index) => ({
      id: `AL-${index + 1}`,
      title: `${item.region} için ${item.riskBand.toUpperCase()} alarm`,
      detail: `${item.city} sahasında sıcaklık ${item.temperatureC}°C, nem %${item.humidity}, rüzgar ${item.windKmh} km/s.`,
      action:
        item.score >= 80
          ? "Hava devriyesi, mobil gözetim ve kara ekibi eşzamanlı devreye alınmalı."
          : "Yakın istasyon ekipleri ön konumlandırmaya alınmalı ve kule teyidi güçlendirilmeli."
    }));
}

function buildInsights(scoredHotspots, stations) {
  const highestWind = scoredHotspots.reduce((top, item) => (item.windKmh > top.windKmh ? item : top));
  const lowestHumidity = scoredHotspots.reduce((top, item) => (item.humidity < top.humidity ? item : top));
  const lowestReadiness = stations.reduce((top, item) => (item.readiness < top.readiness ? item : top));

  return {
    wind: `${highestWind.region} / ${highestWind.windKmh} km/s`,
    humidity: `${lowestHumidity.region} / %${lowestHumidity.humidity}`,
    readiness: `${lowestReadiness.name} / ${lowestReadiness.readiness} puan`
  };
}

function buildTimeline(scoredHotspots) {
  const topHotspot = scoredHotspots[0];

  return [
    {
      minute: "00-10 dk",
      title: "Algılama ve teyit",
      detail: `${topHotspot.region} için kule gözlemi, drone yönlendirmesi ve meteoroloji teyidi başlatılır.`
    },
    {
      minute: "10-25 dk",
      title: "Ekiplerin ön konumlandırılması",
      detail: "En yakın istasyon ekipleri, rüzgar yönü dikkate alınarak emniyetli yaklaşma hatlarına çekilir."
    },
    {
      minute: "25-40 dk",
      title: "Yayılım çizgisinin tahmini",
      detail: "Topoğrafya ve rüzgar etkisine göre ilk ilerleme koridoru hesaplanır, ikinci risk bandı işaretlenir."
    },
    {
      minute: "40-60 dk",
      title: "Kaynak yoğunlaştırma kararı",
      detail: "Skor kritik kalırsa hava aracı, ek kara ekibi ve lojistik destek kademeli olarak artırılır."
    }
  ];
}

function buildMethodology() {
  return [
    { label: "Sıcaklık Baskısı", maxContribution: 24, description: "Yüzey ısısı arttıkça tutuşma eşiği düşer." },
    { label: "Nem Açığı", maxContribution: 18, description: "Düşük nem, yanıcı örtünün kurumasını hızlandırır." },
    { label: "Rüzgar Hızı", maxContribution: 16, description: "Rüzgar, sıçrama ve yatay yayılım riskini artırır." },
    { label: "Kuruluk", maxContribution: 14, description: "Bitki örtüsü kuruluğu temel yanıcılık göstergesidir." },
    { label: "Yakıt Yükü", maxContribution: 12, description: "Yoğun organik örtü yüksek enerji üretimi anlamına gelir." },
    { label: "Müdahale Süresi", maxContribution: 10, description: "Geciken erişim yangının büyüme penceresini genişletir." }
  ];
}

async function buildDashboardPayload(env, token) {
  const hotspots = readHotspots();
  const stations = summarizeStations(readStations());
  const notifications = listNotifications().slice(0, 5);

  const scoredHotspots = [];
  for (const hotspot of hotspots) {
    const adjustment = await getWeatherAdjustment(env, hotspot);
    scoredHotspots.push({
      ...scoreHotspot(hotspot, adjustment),
      weatherSource: adjustment.source
    });
  }

  scoredHotspots.sort((a, b) => b.score - a.score);

  return {
    generatedAt: new Date().toISOString(),
    metadata: {
      systemMode: env.WEATHER_PROVIDER === "mock" ? "simulation" : "live-ready",
      notificationMode: env.ALERT_WEBHOOK_URL ? "webhook-ready" : "mock",
      environment: env.NODE_ENV,
      weatherSourceStatus: scoredHotspots[0]?.weatherSource || "mock",
      storage: "sqlite"
    },
    user: getCurrentUser(token),
    metrics: buildMetrics(scoredHotspots, stations),
    hotspots: scoredHotspots,
    stations,
    alerts: buildAlerts(scoredHotspots),
    insights: buildInsights(scoredHotspots, stations),
    timeline: buildTimeline(scoredHotspots),
    methodology: buildMethodology(),
    incidents: listIncidents(),
    notifications
  };
}

module.exports = { buildDashboardPayload };
