import { getDashboardData, getUsers, loginAs } from "./dashboardService.js";

const state = {
  data: null,
  filteredHotspots: [],
  map: null,
  layerVisibility: {
    hotspots: true,
    stations: true,
    coverage: true
  },
  layers: {
    hotspots: [],
    stations: [],
    coverage: []
  }
};

const metricsGrid = document.querySelector("#metricsGrid");
const riskList = document.querySelector("#riskList");
const alertsList = document.querySelector("#alertsList");
const stationList = document.querySelector("#stationList");
const timelineList = document.querySelector("#timelineList");
const methodologyGrid = document.querySelector("#methodologyGrid");
const incidentList = document.querySelector("#incidentList");
const selectionCard = document.querySelector("#selectionCard");
const operatorCard = document.querySelector("#operatorCard");
const cityFilter = document.querySelector("#cityFilter");
const riskFilter = document.querySelector("#riskFilter");
const sortFilter = document.querySelector("#sortFilter");
const riskCountChip = document.querySelector("#riskCountChip");
const lastUpdatedChip = document.querySelector("#lastUpdatedChip");
const simulateButton = document.querySelector("#simulateButton");
const architectureButton = document.querySelector("#architectureButton");
const dashboardTabs = document.querySelectorAll("[data-dashboard-tab]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const systemStatus = document.querySelector("#systemStatus");
const integrationStatus = document.querySelector("#integrationStatus");
const alertStatusChip = document.querySelector("#alertStatusChip");
const testAlertButton = document.querySelector("#testAlertButton");
const userSelect = document.querySelector("#userSelect");
const loginButton = document.querySelector("#loginButton");

function formatTimestamp(isoString) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoString));
}

function renderMetrics() {
  metricsGrid.innerHTML = state.data.metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
          <p>${metric.detail}</p>
        </article>
      `
    )
    .join("");
}

function renderRiskList() {
  riskCountChip.textContent = `${state.filteredHotspots.length} bölge`;

  riskList.innerHTML = state.filteredHotspots
    .map(
      (item, index) => `
        <article class="risk-item ${item.riskBand}" data-hotspot-id="${item.id}">
          <div class="risk-rank">${String(index + 1).padStart(2, "0")}</div>
          <div class="risk-copy">
            <div class="risk-title-row">
              <h4>${item.region}</h4>
              <span class="band-tag ${item.riskBand}">${item.riskBand}</span>
            </div>
            <p>${item.city} • Skor ${item.score} • Müdahale ${item.responseMinutes} dk</p>
            <div class="driver-row">
              ${item.drivers.map((driver) => `<span>${driver.label}: ${driver.value}</span>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");

  riskList.querySelectorAll("[data-hotspot-id]").forEach((element) => {
    element.addEventListener("click", () => selectHotspot(element.dataset.hotspotId));
  });
}

function renderAlerts() {
  alertsList.innerHTML = state.data.alerts
    .map(
      (alert) => `
        <article class="alert-card">
          <span class="alert-id">${alert.id}</span>
          <h4>${alert.title}</h4>
          <p>${alert.detail}</p>
          <strong>${alert.action}</strong>
        </article>
      `
    )
    .join("");
}

function renderStations() {
  stationList.innerHTML = state.data.stations
    .map(
      (station) => `
        <article class="station-card ${station.status}">
          <div class="station-title-row">
            <div>
              <h4>${station.name}</h4>
              <p>${station.label} • ${station.coverageKm} km kapsama</p>
            </div>
            <span class="station-score">${station.readiness}</span>
          </div>
          <div class="station-meta">
            <span>${station.crews} ekip</span>
            <span>${station.drones} drone</span>
            <span>${station.id}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTimeline() {
  timelineList.innerHTML = state.data.timeline
    .map(
      (item) => `
        <article class="timeline-item">
          <span class="timeline-minute">${item.minute}</span>
          <div>
            <h4>${item.title}</h4>
            <p>${item.detail}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderInsights() {
  document.querySelector("#windInsight").textContent = state.data.insights.wind;
  document.querySelector("#humidityInsight").textContent = state.data.insights.humidity;
  document.querySelector("#readinessInsight").textContent = state.data.insights.readiness;
}

function renderMethodology() {
  methodologyGrid.innerHTML = state.data.methodology
    .map(
      (factor) => `
        <article class="method-card">
          <span>${factor.label}</span>
          <strong>${factor.maxContribution} puan</strong>
          <p>${factor.description}</p>
        </article>
      `
    )
    .join("");
}

function renderIncidents() {
  incidentList.innerHTML = state.data.incidents
    .map(
      (incident) => `
        <article class="incident-card ${incident.severity}">
          <div class="incident-top-row">
            <strong>${incident.title}</strong>
            <span class="incident-badge ${incident.severity}">${incident.severity}</span>
          </div>
          <p>${incident.summary}</p>
          <div class="incident-meta">
            <span>${incident.id}</span>
            <span>${incident.owner}</span>
            <span>${formatTimestamp(incident.detectedAt)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderUserContext() {
  const { user, metadata } = state.data;
  operatorCard.innerHTML = `
    <span class="selection-label">Aktif Operatör</span>
    <h4>${user.name}</h4>
    <p>${user.role} • ${user.organization}</p>
    <div class="selection-driver-list">
      ${user.permissions.map((permission) => `<span>${permission}</span>`).join("")}
    </div>
  `;

  systemStatus.textContent = metadata.systemMode === "live" ? "Live" : "Simulation";
  integrationStatus.textContent =
    metadata.weatherSourceStatus || (metadata.systemMode === "live" ? "Canlı veri" : "Mock veri");
  alertStatusChip.textContent =
    metadata.notificationMode === "webhook-ready" ? "Webhook hazır" : "Bildirim mock modda";
}

async function populateUserSelect() {
  if (!window.location.protocol.startsWith("http")) return;
  const users = await getUsers();
  userSelect.innerHTML = users
    .map((user) => `<option value="${user.id}">${user.name} • ${user.role}</option>`)
    .join("");
}

function populateFilters() {
  const cities = ["all", ...new Set(state.data.hotspots.map((item) => item.city))];
  cityFilter.innerHTML = cities
    .map((city) => `<option value="${city}">${city === "all" ? "Tüm İller" : city}</option>`)
    .join("");
}

function applyFilters() {
  let result = [...state.data.hotspots];

  if (cityFilter.value !== "all") {
    result = result.filter((item) => item.city === cityFilter.value);
  }

  if (riskFilter.value !== "all") {
    result = result.filter((item) => item.riskBand === riskFilter.value);
  }

  if (sortFilter.value === "response-asc") {
    result.sort((a, b) => a.responseMinutes - b.responseMinutes);
  } else if (sortFilter.value === "wind-desc") {
    result.sort((a, b) => b.windKmh - a.windKmh);
  } else {
    result.sort((a, b) => b.score - a.score);
  }

  state.filteredHotspots = result;
  renderRiskList();
  rebuildHotspotLayer();
}

function createMarkerIcon(riskBand) {
  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `<span class="custom-marker ${riskBand}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function selectHotspot(hotspotId) {
  const hotspot = state.data.hotspots.find((item) => item.id === hotspotId);
  if (!hotspot) return;

  selectionCard.innerHTML = `
    <span class="selection-label">Seçili Bölge</span>
    <h4>${hotspot.region}</h4>
    <p>${hotspot.city} • Skor ${hotspot.score} • Güven ${hotspot.confidence}/100</p>
    <div class="selection-driver-list">
      ${hotspot.drivers.map((driver) => `<span>${driver.label}: ${driver.value}</span>`).join("")}
      <span>Kuruluk: ${hotspot.vegetationDryness}/100</span>
      <span>Yakıt yükü: ${hotspot.fuelLoad}/100</span>
      <span>Kaynak: ${hotspot.weatherSource}</span>
    </div>
  `;

  if (state.map) {
    state.map.flyTo(hotspot.coordinates, 8, { duration: 0.7 });
  }
}

function clearLayer(layerName) {
  state.layers[layerName].forEach((layer) => layer.remove());
  state.layers[layerName] = [];
}

function rebuildCoverageLayer() {
  if (!state.map) return;
  clearLayer("coverage");
  if (!state.layerVisibility.coverage) return;

  state.data.stations.forEach((station) => {
    const layer = L.circle(station.coordinates, {
      color: "#92b39b",
      weight: 1,
      fillColor: "#92b39b",
      fillOpacity: 0.12,
      radius: station.coverageKm * 1000
    }).addTo(state.map);

    state.layers.coverage.push(layer);
  });
}

function rebuildStationLayer() {
  if (!state.map) return;
  clearLayer("stations");
  if (!state.layerVisibility.stations) return;

  state.data.stations.forEach((station) => {
    const marker = L.circleMarker(station.coordinates, {
      radius: 6,
      color: "#f9f4ea",
      fillColor: "#f2ebde",
      fillOpacity: 1,
      weight: 2
    })
      .addTo(state.map)
      .bindPopup(
        `<strong>${station.name}</strong><br/>Hazırlık: ${station.readiness}/100<br/>${station.crews} ekip • ${station.drones} drone`
      );

    state.layers.stations.push(marker);
  });
}

function rebuildHotspotLayer() {
  if (!state.map) return;
  clearLayer("hotspots");
  if (!state.layerVisibility.hotspots) return;

  state.filteredHotspots.forEach((spot) => {
    const marker = L.marker(spot.coordinates, {
      icon: createMarkerIcon(spot.riskBand)
    })
      .addTo(state.map)
      .bindPopup(
        `
          <div class="popup-card">
            <strong>${spot.region}</strong><br/>
            Şehir: ${spot.city}<br/>
            Risk Skoru: ${spot.score}<br/>
            Güven: ${spot.confidence}/100<br/>
            Sıcaklık: ${spot.temperatureC}°C<br/>
            Nem: %${spot.humidity}<br/>
            Rüzgar: ${spot.windKmh} km/s<br/>
            Müdahale: ${spot.responseMinutes} dk
          </div>
        `
      )
      .on("click", () => selectHotspot(spot.id));

    state.layers.hotspots.push(marker);
  });
}

function initialiseMap() {
  state.map = L.map("map", {
    zoomControl: false
  }).setView([37.55, 28.9], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(state.map);

  L.control
    .zoom({
      position: "bottomright"
    })
    .addTo(state.map);

  rebuildCoverageLayer();
  rebuildStationLayer();
  rebuildHotspotLayer();
}

async function sendTestAlertRequest() {
  testAlertButton.disabled = true;
  testAlertButton.textContent = "Gönderiliyor...";

  try {
    const response = await fetch("/api/alerts/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Kritik sıcak nokta test alarmı",
        severity: state.filteredHotspots[0]?.riskBand || "high",
        recipient: "regional-ops-demo"
      })
    });

    const payload = await response.json();
    alertStatusChip.textContent = `${payload.alert.channel} • ${payload.alert.status}`;
  } catch (error) {
    alertStatusChip.textContent = "Test alarmı başarısız";
  } finally {
    testAlertButton.disabled = false;
    testAlertButton.textContent = "Test Alarmı Gönder";
  }
}

function bindEvents() {
  [cityFilter, riskFilter, sortFilter].forEach((element) => {
    element.addEventListener("change", applyFilters);
  });

  dashboardTabs.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.dashboardTab;

      dashboardTabs.forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.tabPanel === target);
      });
    });
  });

  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      const layerName = button.dataset.layer;
      state.layerVisibility[layerName] = !state.layerVisibility[layerName];
      button.classList.toggle("active", state.layerVisibility[layerName]);

      if (layerName === "coverage") rebuildCoverageLayer();
      if (layerName === "stations") rebuildStationLayer();
      if (layerName === "hotspots") rebuildHotspotLayer();
    });
  });

  simulateButton.addEventListener("click", async () => {
    simulateButton.disabled = true;
    simulateButton.textContent = "Yenileniyor...";
    await bootstrap();
    simulateButton.disabled = false;
    simulateButton.textContent = "Senaryo Yenile";
  });

  architectureButton.addEventListener("click", () => {
    dashboardTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.dashboardTab === "analysis");
    });
    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tabPanel === "analysis");
    });
    window.location.hash = "methodologySection";
  });

  testAlertButton.addEventListener("click", sendTestAlertRequest);

  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    loginButton.textContent = "Açılıyor...";
    try {
      await loginAs(userSelect.value);
      await bootstrap();
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Oturum Aç";
    }
  });
}

async function bootstrap() {
  state.data = await getDashboardData();
  lastUpdatedChip.textContent = `Güncellendi ${formatTimestamp(state.data.generatedAt)}`;

  renderMetrics();
  renderAlerts();
  renderStations();
  renderTimeline();
  renderInsights();
  renderMethodology();
  renderIncidents();
  renderUserContext();
  await populateUserSelect();
  populateFilters();
  applyFilters();

  if (!state.map) {
    initialiseMap();
    bindEvents();
  } else {
    rebuildCoverageLayer();
    rebuildStationLayer();
    rebuildHotspotLayer();
  }

  if (state.filteredHotspots[0]) {
    selectHotspot(state.filteredHotspots[0].id);
  }
}

bootstrap();
