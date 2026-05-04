export const monitoringStations = [
  {
    id: "ST-01",
    name: "Muğla Merkez İstasyonu",
    coordinates: [37.2153, 28.3636],
    coverageKm: 28,
    crews: 6,
    drones: 2,
    readiness: 91,
    status: "active"
  },
  {
    id: "ST-02",
    name: "Antalya Batı İstasyonu",
    coordinates: [36.8969, 30.7133],
    coverageKm: 34,
    crews: 8,
    drones: 3,
    readiness: 88,
    status: "active"
  },
  {
    id: "ST-03",
    name: "İzmir Kuzey İstasyonu",
    coordinates: [38.4237, 27.1428],
    coverageKm: 24,
    crews: 5,
    drones: 1,
    readiness: 79,
    status: "stretched"
  },
  {
    id: "ST-04",
    name: "Aydın Mobil Gözetim Birimi",
    coordinates: [37.845, 27.8396],
    coverageKm: 18,
    crews: 4,
    drones: 1,
    readiness: 74,
    status: "monitoring"
  }
];

export const hotspots = [
  {
    id: "HS-101",
    region: "Milas Çamlık Kuşağı",
    city: "Muğla",
    coordinates: [37.3568, 27.7834],
    temperatureC: 39,
    humidity: 18,
    windKmh: 31,
    vegetationDryness: 87,
    responseMinutes: 19,
    slope: 22,
    fuelLoad: 81,
    watchtowerConfidence: 86
  },
  {
    id: "HS-102",
    region: "Manavgat Güney Hattı",
    city: "Antalya",
    coordinates: [36.7867, 31.4432],
    temperatureC: 41,
    humidity: 16,
    windKmh: 28,
    vegetationDryness: 92,
    responseMinutes: 24,
    slope: 18,
    fuelLoad: 88,
    watchtowerConfidence: 82
  },
  {
    id: "HS-103",
    region: "Seferihisar Orman Koridoru",
    city: "İzmir",
    coordinates: [38.1967, 26.8382],
    temperatureC: 34,
    humidity: 27,
    windKmh: 19,
    vegetationDryness: 69,
    responseMinutes: 14,
    slope: 12,
    fuelLoad: 66,
    watchtowerConfidence: 73
  },
  {
    id: "HS-104",
    region: "Fethiye Kıyı Bandı",
    city: "Muğla",
    coordinates: [36.6214, 29.1164],
    temperatureC: 37,
    humidity: 22,
    windKmh: 35,
    vegetationDryness: 81,
    responseMinutes: 17,
    slope: 25,
    fuelLoad: 79,
    watchtowerConfidence: 84
  },
  {
    id: "HS-105",
    region: "Bergama Kuzey Sırtları",
    city: "İzmir",
    coordinates: [39.1202, 27.1803],
    temperatureC: 33,
    humidity: 29,
    windKmh: 16,
    vegetationDryness: 61,
    responseMinutes: 11,
    slope: 14,
    fuelLoad: 58,
    watchtowerConfidence: 76
  },
  {
    id: "HS-106",
    region: "Alanya İç Geçiş Kuşağı",
    city: "Antalya",
    coordinates: [36.5444, 32.0008],
    temperatureC: 38,
    humidity: 20,
    windKmh: 26,
    vegetationDryness: 84,
    responseMinutes: 21,
    slope: 20,
    fuelLoad: 75,
    watchtowerConfidence: 80
  },
  {
    id: "HS-107",
    region: "Kuşadası Dilek Yarımadası",
    city: "Aydın",
    coordinates: [37.7333, 27.1833],
    temperatureC: 36,
    humidity: 24,
    windKmh: 27,
    vegetationDryness: 77,
    responseMinutes: 18,
    slope: 17,
    fuelLoad: 73,
    watchtowerConfidence: 78
  }
];
