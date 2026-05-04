async function getWeatherAdjustment(env, hotspot) {
  if (env.WEATHER_PROVIDER === "mock") {
    return {
      source: "mock",
      temperatureC: hotspot.temperatureC,
      humidity: hotspot.humidity,
      windKmh: hotspot.windKmh
    };
  }

  if (env.WEATHER_PROVIDER === "openweather" && env.OPENWEATHER_API_KEY) {
    const latitude = hotspot.coordinates[0];
    const longitude = hotspot.coordinates[1];
    const url =
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}` +
      `&units=metric&appid=${env.OPENWEATHER_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`OpenWeather returned ${response.status}`);
      const payload = await response.json();
      return {
        source: "openweather",
        temperatureC: Math.round(payload.main.temp),
        humidity: payload.main.humidity,
        windKmh: Math.round((payload.wind.speed || 0) * 3.6)
      };
    } catch (error) {
      return {
        source: "openweather-fallback",
        temperatureC: hotspot.temperatureC,
        humidity: hotspot.humidity,
        windKmh: hotspot.windKmh,
        error: error.message
      };
    }
  }

  const latitude = hotspot.coordinates[0];
  const longitude = hotspot.coordinates[1];
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
    const payload = await response.json();
    return {
      source: "open-meteo",
      temperatureC: Math.round(payload.current.temperature_2m),
      humidity: Math.round(payload.current.relative_humidity_2m),
      windKmh: Math.round(payload.current.wind_speed_10m)
    };
  } catch (error) {
    return {
      source: "open-meteo-fallback",
      temperatureC: hotspot.temperatureC,
      humidity: hotspot.humidity,
      windKmh: hotspot.windKmh,
      error: error.message
    };
  }
}

module.exports = { getWeatherAdjustment };
