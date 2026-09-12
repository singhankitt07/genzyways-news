"use client";

import { useEffect, useState } from "react";

type Weather = { temperature: number; weatherCode: number; city: string };

function weatherLabel(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  return "Storm";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState("Location weather");

  useEffect(() => {
    const saved = window.localStorage.getItem("genzywaynews-weather");
    if (saved) setWeather(JSON.parse(saved));
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=auto`);
        const data = await response.json();
        const next = { temperature: Math.round(data.current.temperature_2m), weatherCode: data.current.weather_code, city: "Your location" };
        setWeather(next);
        window.localStorage.setItem("genzywaynews-weather", JSON.stringify(next));
      } catch {
        setStatus("Weather unavailable");
      }
    }, () => setStatus("Allow location for weather"), { maximumAge: 900000, timeout: 8000 });
  }, []);

  if (!weather) return <span className="hidden lg:block text-[11px] text-ink/50">{status}</span>;
  return <span className="hidden sm:block text-[11px] text-ink/60" title="Weather is based on your browser location and is not stored by GenzyWayNews">{weather.city} {weather.temperature}°C · {weatherLabel(weather.weatherCode)}</span>;
}
