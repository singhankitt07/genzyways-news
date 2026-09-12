"use client";

import { useEffect, useState } from "react";

type Weather = { temperature: number; weatherCode: number; city: string; region?: string; country?: string };

function weatherLabel(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  return "Storm";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState("Allow location for local weather");

  useEffect(() => {
    const saved = window.localStorage.getItem("genzywaynews-weather");
    if (saved) {
      const cached: Weather = JSON.parse(saved);
      if (cached.city !== "Your location") setWeather(cached);
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const [weatherResponse, locationResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=auto`),
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`)
        ]);
        if (!weatherResponse.ok || !locationResponse.ok) throw new Error("Weather lookup failed");
        const data = await weatherResponse.json();
        const location = await locationResponse.json();
        const city = location.city || location.locality || location.principalSubdivision || "Your location";
        const next = {
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          city,
          region: location.principalSubdivision,
          country: location.countryName
        };
        setWeather(next);
        window.localStorage.setItem("genzywaynews-weather", JSON.stringify(next));
      } catch {
        setStatus("Weather unavailable - check location permission");
      }
    }, () => setStatus("Allow location for local weather"), { maximumAge: 900000, timeout: 12000, enableHighAccuracy: false });
  }, []);

  if (!weather) return <span className="text-[11px] text-ink/50 truncate max-w-44">{status}</span>;
  const location = [weather.city, weather.region, weather.country].filter(Boolean).join(", ");
  return <span className="text-[11px] text-ink/60 truncate max-w-52" title="Weather is based on your browser location and is not stored by GenzyWayNews">{location} · {weather.temperature}°C · {weatherLabel(weather.weatherCode)}</span>;
}
