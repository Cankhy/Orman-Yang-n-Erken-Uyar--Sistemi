function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRiskBand(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function scoreHotspot(hotspot, weatherAdjustment = {}) {
  const temperatureC = weatherAdjustment.temperatureC ?? hotspot.temperatureC;
  const humidity = weatherAdjustment.humidity ?? hotspot.humidity;
  const windKmh = weatherAdjustment.windKmh ?? hotspot.windKmh;

  const factors = {
    temperature: clamp((temperatureC - 20) * 1.5, 0, 24),
    humidity: clamp((40 - humidity) * 0.75, 0, 18),
    wind: clamp(windKmh * 0.55, 0, 16),
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

  return {
    ...hotspot,
    temperatureC,
    humidity,
    windKmh,
    score,
    confidence: Math.round(hotspot.watchtowerConfidence * 0.65 + hotspot.vegetationDryness * 0.35),
    riskBand: getRiskBand(score),
    drivers: [
      { label: "Sıcaklık", value: `${temperatureC}°C` },
      { label: "Nem", value: `%${humidity}` },
      { label: "Rüzgar", value: `${windKmh} km/s` }
    ]
  };
}

function summarizeStations(stations) {
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

function buildMetrics(scoredHotspots, stations) {
  const critical = scoredHotspots.filter((item) => item.riskBand === "critical").length;
  const high = scoredHotspots.filter((item) => item.riskBand === "high").length;
  const avgResponse =
    scoredHotspots.reduce((sum, item) => sum + item.responseMinutes, 0) / scoredHotspots.length;
  const readiness = stations.reduce((sum, item) => sum + item.readiness, 0) / stations.length;

  return [
    { label: "Kritik Bölge", value: `${critical}`, detail: "hemen müdahale önceliği" },
    { label: "Yüksek Risk", value: `${high}`, detail: "yakın izleme alanı" },
    { label: "Ort. Müdahale", value: `${avgResponse.toFixed(1)} dk`, detail: "ilk erişim süresi" },
    { label: "Hazırlık Skoru", value: `${readiness.toFixed(0)}/100`, detail: "istasyon ortalaması" }
  ];
}

module.exports = { scoreHotspot, getRiskBand, summarizeStations, buildMetrics };
