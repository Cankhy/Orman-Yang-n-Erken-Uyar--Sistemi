const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const factorWeights = [
  { key: "temperatureC", label: "Sıcaklık Baskısı", maxContribution: 24 },
  { key: "humidity", label: "Nem Açığı", maxContribution: 18 },
  { key: "windKmh", label: "Rüzgar Hızı", maxContribution: 16 },
  { key: "vegetationDryness", label: "Kuruluk", maxContribution: 14 },
  { key: "fuelLoad", label: "Yakıt Yükü", maxContribution: 12 },
  { key: "responseMinutes", label: "Müdahale Süresi", maxContribution: 10 },
  { key: "slope", label: "Topoğrafya", maxContribution: 6 }
];

export function getRiskBand(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function scoreHotspot(hotspot) {
  const factors = {
    temperature: clamp((hotspot.temperatureC - 20) * 1.5, 0, 24),
    humidity: clamp((40 - hotspot.humidity) * 0.75, 0, 18),
    wind: clamp(hotspot.windKmh * 0.55, 0, 16),
    dryness: clamp(hotspot.vegetationDryness * 0.16, 0, 14),
    fuel: clamp(hotspot.fuelLoad * 0.15, 0, 12),
    response: clamp(hotspot.responseMinutes * 0.42, 0, 10),
    slope: clamp(hotspot.slope * 0.3, 0, 6)
  };

  const score = Math.round(
    factors.temperature +
      factors.humidity +
      factors.wind +
      factors.dryness +
      factors.fuel +
      factors.response +
      factors.slope
  );

  const confidence = Math.round(
    hotspot.watchtowerConfidence * 0.65 + hotspot.vegetationDryness * 0.35
  );

  const drivers = [
    { label: "Sıcaklık", value: `${hotspot.temperatureC}°C` },
    { label: "Nem", value: `%${hotspot.humidity}` },
    { label: "Rüzgar", value: `${hotspot.windKmh} km/s` }
  ];

  return {
    ...hotspot,
    score,
    confidence,
    drivers,
    riskBand: getRiskBand(score)
  };
}

export function buildSystemMetrics(scoredHotspots, stations) {
  const criticalCount = scoredHotspots.filter((item) => item.riskBand === "critical").length;
  const highCount = scoredHotspots.filter((item) => item.riskBand === "high").length;
  const avgResponse =
    scoredHotspots.reduce((total, item) => total + item.responseMinutes, 0) / scoredHotspots.length;
  const readiness = stations.reduce((total, item) => total + item.readiness, 0) / stations.length;

  return [
    { label: "Kritik Bölge", value: `${criticalCount}`, detail: "hemen müdahale önceliği" },
    { label: "Yüksek Risk", value: `${highCount}`, detail: "yakın izleme alanı" },
    { label: "Ort. Müdahale", value: `${avgResponse.toFixed(1)} dk`, detail: "ilk erişim süresi" },
    { label: "Hazırlık Skoru", value: `${readiness.toFixed(0)}/100`, detail: "istasyon ortalaması" }
  ];
}

export function buildAlerts(scoredHotspots) {
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

export function buildInsights(scoredHotspots, stations) {
  const highestWind = scoredHotspots.reduce((top, item) =>
    item.windKmh > top.windKmh ? item : top
  );
  const lowestHumidity = scoredHotspots.reduce((top, item) =>
    item.humidity < top.humidity ? item : top
  );
  const lowestReadiness = stations.reduce((top, item) =>
    item.readiness < top.readiness ? item : top
  );

  return {
    wind: `${highestWind.region} / ${highestWind.windKmh} km/s`,
    humidity: `${lowestHumidity.region} / %${lowestHumidity.humidity}`,
    readiness: `${lowestReadiness.name} / ${lowestReadiness.readiness} puan`
  };
}

export function buildTimeline(scoredHotspots) {
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

export function buildMethodology() {
  return factorWeights.map((factor) => ({
    ...factor,
    description: `${factor.label}, toplam risk skoruna en fazla ${factor.maxContribution} puan katkı sağlar.`
  }));
}

export function buildStationSummary(stations) {
  return stations.map((station) => ({
    ...station,
    label:
      station.readiness >= 85
        ? "Hazır"
        : station.readiness >= 75
          ? "Yoğun"
          : "Yakın izleme"
  }));
}

export function serializeDashboard(payload) {
  return {
    generatedAt: new Date().toISOString(),
    ...payload
  };
}
