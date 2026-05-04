const path = require("path");

function getEnv() {
  return {
    APP_NAME: process.env.APP_NAME || "Forest Fire Early Warning System",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3000),
    WEATHER_PROVIDER: process.env.WEATHER_PROVIDER || "open-meteo",
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || "",
    ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL || "",
    DEFAULT_ROLE: process.env.DEFAULT_ROLE || "incident-commander",
    DATA_DIR:
      process.env.DATA_DIR ||
      path.join(__dirname, "..", "data")
  };
}

module.exports = { getEnv };
