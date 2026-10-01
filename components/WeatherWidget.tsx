"use client";

import { useEffect, useState } from "react";

type Weather = { temperature: number; weatherCode: number; city: string; region?: string; country?: string; aqi?: number | null; pm25?: number | null; locationSource: "browser" | "ip"; updatedAt: number };
type WeatherCoordinates = { latitude: number; longitude: number };
type ApproximateLocation = WeatherCoordinates & { city?: string; region?: string; country?: string; timezone?: string };
const CACHE_KEY = "genzywaynews-weather";
const REFRESH_MS = 15 * 60 * 1000;

function weatherLabel(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  return "Storm";
}

function aqiLabel(value?: number | null) {
  if (value == null) return "AQI unavailable";
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Sensitive";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very unhealthy";
  return "Hazardous";
}

function WeatherIcon({ code }: { code: number }) {
  const cloudy = code >= 1 && code <= 3;
  const rainy = code >= 51 && code <= 67;
  const snowy = code >= 71 && code <= 77;
  const stormy = code >= 80 || code === 95 || code === 96 || code === 99;
  return <span className={`weather-icon weather-icon-${stormy ? "storm" : rainy ? "rain" : snowy ? "snow" : cloudy ? "cloud" : "clear"}`} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="14" r="5" className="weather-sun" />{!stormy && !rainy && !snowy && <path d="M16 3v3m0 16v3M5 14h3m16 0h3M8.2 6.2l2.1 2.1m11.4 11.4 2.1 2.1M8.2 21.8l2.1-2.1m11.4-11.4 2.1-2.1" className="weather-sun" />}{(cloudy || rainy || snowy || stormy) && <path d="M8 23h14a5 5 0 0 0 .5-9.97A7.5 7.5 0 0 0 8 15a4 4 0 0 0 0 8Z" className="weather-cloud" />}{rainy && <path d="m11 26-1 2m6-2-1 2m6-2-1 2" className="weather-rain" />}{snowy && <path d="M11 27h.01m5 0h.01m5 0h.01" className="weather-snow" />}{stormy && <path d="m17 18-3 5h3l-2 5 6-8h-3l2-5Z" className="weather-storm" />}</svg></span>;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState("Requesting location for local weather");
  const [locationAttempt, setLocationAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let refreshTimer: number | undefined;
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const saved = JSON.parse(cached) as Weather;
        if (saved.city !== "Your location") setWeather(saved);
      } catch {
        window.localStorage.removeItem(CACHE_KEY);
      }
    }

    async function load(coords: WeatherCoordinates, locationSource: Weather["locationSource"], approximateLocation?: ApproximateLocation) {
      try {
        const timezone = approximateLocation?.timezone || "auto";
        const query = `latitude=${coords.latitude}&longitude=${coords.longitude}&timezone=${encodeURIComponent(timezone)}`;
        const [weatherResponse, airResponse, locationResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?${query}&current=temperature_2m,weather_code`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${query}&current=us_aqi,pm2_5,pm10`),
          approximateLocation ? Promise.resolve(null) : fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`)
        ]);
        if (!weatherResponse.ok || (locationResponse && !locationResponse.ok)) throw new Error("Weather lookup failed");
        const data = await weatherResponse.json();
        const air = airResponse.ok ? await airResponse.json() : null;
        const location = approximateLocation || await locationResponse?.json();
        const next: Weather = { temperature: Math.round(data.current.temperature_2m), weatherCode: data.current.weather_code, city: location?.city || location?.locality || location?.principalSubdivision || "Your location", region: location?.region || location?.principalSubdivision, country: location?.country || location?.countryName, aqi: air?.current?.us_aqi ?? null, pm25: air?.current?.pm2_5 ?? null, locationSource, updatedAt: Date.now() };
        if (!active) return;
        setWeather(next);
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        setStatus("");
      } catch {
        if (active) setStatus("Weather unavailable");
      }
    }

    async function loadApproximateLocation() {
      setStatus("Finding approximate location from network");
      try {
        const response = await fetch("/api/weather-location", { cache: "no-store" });
        if (!response.ok) throw new Error("Approximate location is unavailable");
        const location = await response.json() as ApproximateLocation;
        if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) throw new Error("Approximate coordinates are invalid");
        await load(location, "ip", location);
        if (active) refreshTimer = window.setTimeout(loadApproximateLocation, REFRESH_MS);
      } catch {
        if (active) setStatus("Location unavailable; try again");
      }
    }

    function requestLocation() {
      if (!navigator.geolocation) {
        void loadApproximateLocation();
        return;
      }
      setStatus("Requesting location for local weather");
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (!active) return;
        void load(coords, "browser");
        refreshTimer = window.setTimeout(requestLocation, REFRESH_MS);
      }, () => {
        if (active) void loadApproximateLocation();
      }, { maximumAge: REFRESH_MS, timeout: 12000, enableHighAccuracy: false });
    }
    requestLocation();
    return () => { active = false; if (refreshTimer) window.clearTimeout(refreshTimer); };
  }, [locationAttempt]);

  if (!weather) return <span className="weather-widget weather-widget-loading"><span className="weather-icon weather-icon-cloud" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 23h14a5 5 0 0 0 .5-9.97A7.5 7.5 0 0 0 8 15a4 4 0 0 0 0 8Z" /></svg></span><span className="weather-widget-loading-label">{status}</span>{status.startsWith("Location blocked") || status.startsWith("Location unavailable") ? <button type="button" onClick={() => setLocationAttempt((attempt) => attempt + 1)} className="weather-location-action" aria-label="Retry location request">Retry</button> : null}</span>;
  const location = [weather.city, weather.region, weather.country].filter(Boolean).join(", ");
  const locationTitle = weather.locationSource === "ip" ? `Approximate IP-based location: ${location}` : `Precise browser location: ${location}`;
  return <span className="weather-widget" title={`${locationTitle}. Air quality: ${aqiLabel(weather.aqi)}. Data refreshes every 15 minutes.`}><WeatherIcon code={weather.weatherCode} /><span className="weather-reading"><strong>{weather.temperature}°C</strong><span>{weatherLabel(weather.weatherCode)}</span></span><span className={`weather-aqi weather-aqi-${weather.aqi == null ? "unknown" : weather.aqi <= 50 ? "good" : weather.aqi <= 100 ? "moderate" : "poor"}`}><b>AQI</b> {weather.aqi == null ? "—" : Math.round(weather.aqi)}<small>{aqiLabel(weather.aqi)}</small></span><span className="weather-location">{weather.locationSource === "ip" && <span className="weather-location-approx">Approx. </span>}{location}</span>{status.startsWith("Location unavailable") ? <button type="button" onClick={() => setLocationAttempt((attempt) => attempt + 1)} className="weather-location-action" aria-label="Retry location request">Retry</button> : null}</span>;
}
