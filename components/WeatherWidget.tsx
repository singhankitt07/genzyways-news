"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Source = "manual" | "gps" | "ip" | "default";
type Place = { latitude: number; longitude: number; city: string; region?: string; country?: string; timezone?: string };
type Weather = Place & { temperature: number; weatherCode: number; aqi?: number | null; pm25?: number | null; source: Source; updatedAt: number };
type Permission = "granted" | "prompt" | "denied" | "unknown";

const CACHE_KEY = "genzywaynews-weather-v2";
const MANUAL_KEY = "genzywaynews-city";
const REFRESH_MS = 15 * 60 * 1000;
const DEFAULT_PLACE: Place = { latitude: 28.6139, longitude: 77.209, city: "Delhi", region: "Delhi", country: "India", timezone: "Asia/Kolkata" };
const RANK: Record<Source, number> = { default: 1, ip: 2, gps: 3, manual: 4 };
const SOURCE_LABEL: Record<Source, string> = { manual: "City you selected", gps: "Your precise location", ip: "Approximate location (from network)", default: "Default location" };
export const WEATHER_LOCATE_EVENT = "genzywaynews:weather-locate";

const inflight = new Map<string, Promise<Weather>>();

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

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

function fetchWeather(place: Place, source: Source): Promise<Weather> {
  const key = `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)},${source}`;
  const pending = inflight.get(key);
  if (pending) return pending;
  const request = (async () => {
    const query = `latitude=${place.latitude}&longitude=${place.longitude}&timezone=${encodeURIComponent(place.timezone || "auto")}`;
    const [weatherResponse, airResponse] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${query}&current=temperature_2m,weather_code`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${query}&current=us_aqi,pm2_5`).catch(() => null)
    ]);
    if (!weatherResponse.ok) throw new Error("Weather lookup failed");
    const data = await weatherResponse.json();
    const air = airResponse?.ok ? await airResponse.json().catch(() => null) : null;
    return { ...place, temperature: Math.round(data.current.temperature_2m), weatherCode: data.current.weather_code, aqi: air?.current?.us_aqi ?? null, pm25: air?.current?.pm2_5 ?? null, source, updatedAt: Date.now() };
  })().finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Place> {
  const fallback: Place = { latitude, longitude, city: "Your location" };
  try {
    const response = await fetch(`/api/reverse-geocode?lat=${latitude.toFixed(2)}&lon=${longitude.toFixed(2)}`);
    if (!response.ok) return fallback;
    const data = await response.json() as { city?: string; region?: string; country?: string };
    return { ...fallback, city: data.city || fallback.city, region: data.region, country: data.country };
  } catch {
    return fallback;
  }
}

async function fetchIpPlace(): Promise<Place | null> {
  try {
    const response = await fetch("/api/weather-location", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json() as Place & { city?: string };
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return null;
    if (data.city) return data;
    return { ...data, ...(await reverseGeocode(data.latitude, data.longitude)), timezone: data.timezone };
  } catch {
    return null;
  }
}

function WeatherIcon({ code }: { code: number }) {
  const cloudy = code >= 1 && code <= 3;
  const rainy = code >= 51 && code <= 67;
  const snowy = code >= 71 && code <= 77;
  const stormy = code >= 80 || code === 95 || code === 96 || code === 99;
  return <span className={`weather-icon weather-icon-${stormy ? "storm" : rainy ? "rain" : snowy ? "snow" : cloudy ? "cloud" : "clear"}`} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="14" r="5" className="weather-sun" />{!stormy && !rainy && !snowy && <path d="M16 3v3m0 16v3M5 14h3m16 0h3M8.2 6.2l2.1 2.1m11.4 11.4 2.1 2.1M8.2 21.8l2.1-2.1m11.4-11.4 2.1-2.1" className="weather-sun" />}{(cloudy || rainy || snowy || stormy) && <path d="M8 23h14a5 5 0 0 0 .5-9.97A7.5 7.5 0 0 0 8 15a4 4 0 0 0 0 8Z" className="weather-cloud" />}{rainy && <path d="m11 26-1 2m6-2-1 2m6-2-1 2" className="weather-rain" />}{snowy && <path d="M11 27h.01m5 0h.01m5 0h.01" className="weather-snow" />}{stormy && <path d="m17 18-3 5h3l-2 5 6-8h-3l2-5Z" className="weather-storm" />}</svg></span>;
}

type SearchResult = Place;

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);
  const [permission, setPermission] = useState<Permission>("unknown");
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [run, setRun] = useState(0);
  const rankRef = useRef(0);
  const permissionRef = useRef<Permission>("unknown");
  const currentRef = useRef<{ place: Place; source: Source } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const setPerm = useCallback((value: Permission) => {
    permissionRef.current = value;
    setPermission(value);
  }, []);

  // Lower-priority sources never overwrite a higher-priority one: manual > GPS > IP > default.
  const apply = useCallback(async (place: Place, source: Source) => {
    if (RANK[source] < rankRef.current) return;
    try {
      const next = await fetchWeather(place, source);
      if (RANK[source] < rankRef.current) return;
      rankRef.current = RANK[source];
      currentRef.current = { place, source };
      setWeather(next);
      setFailed(false);
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      setFailed(true);
    }
  }, []);

  const readPosition = useCallback(() => {
    if (permissionRef.current === "denied" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (window.localStorage.getItem(MANUAL_KEY)) return;
      const place = await reverseGeocode(coords.latitude, coords.longitude);
      void apply(place, "gps");
    }, (error) => {
      if (error.code === 1) setPerm("denied");
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 });
  }, [apply, setPerm]);

  useEffect(() => {
    let active = true;
    let permissionStatus: PermissionStatus | undefined;
    rankRef.current = 0;

    const cached = readJson<Weather>(CACHE_KEY);
    if (cached?.city) setWeather(cached);

    async function init() {
      const manual = readJson<Place>(MANUAL_KEY);
      if (manual) {
        await apply(manual, "manual");
        return;
      }

      const onPermission = (state: PermissionState) => {
        setPerm(state);
        if (state === "granted") readPosition();
      };
      if (navigator.geolocation && navigator.permissions?.query) {
        try {
          permissionStatus = await navigator.permissions.query({ name: "geolocation" });
          if (!active) return;
          permissionStatus.onchange = () => { if (permissionStatus) onPermission(permissionStatus.state); };
          if (permissionStatus.state === "granted") readPosition();
          setPerm(permissionStatus.state);
        } catch {
          setPerm(navigator.geolocation ? "prompt" : "denied");
        }
      } else {
        // Older Safari has no geolocation permission query; the user can still opt in with a click.
        setPerm(navigator.geolocation ? "prompt" : "denied");
      }

      const ip = await fetchIpPlace();
      if (!active) return;
      await apply(ip ?? DEFAULT_PLACE, ip ? "ip" : "default");
    }

    void init();
    const timer = window.setInterval(() => {
      const current = currentRef.current;
      if (current) void apply(current.place, current.source);
    }, REFRESH_MS);
    const onLocate = () => { if (!window.localStorage.getItem(MANUAL_KEY)) readPosition(); };
    window.addEventListener(WEATHER_LOCATE_EVENT, onLocate);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(WEATHER_LOCATE_EVENT, onLocate);
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [apply, readPosition, setPerm, run]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: Event) => { if (!wrapRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await response.json() as { results?: SearchResult[] };
        setResults(data.results || []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  function chooseCity(place: Place) {
    window.localStorage.setItem(MANUAL_KEY, JSON.stringify(place));
    rankRef.current = 0;
    setTerm("");
    setResults([]);
    setOpen(false);
    void apply(place, "manual");
  }

  function useAutomatic() {
    window.localStorage.removeItem(MANUAL_KEY);
    setOpen(false);
    setRun((value) => value + 1);
  }

  const canImprove = permission === "prompt" && weather?.source !== "manual" && weather?.source !== "gps";
  const place = weather ? [weather.city, weather.region, weather.country].filter(Boolean).filter((part, index, all) => all.indexOf(part) === index).join(", ") : "";

  if (!weather) {
    return <span className="weather-widget-wrap" role="status" aria-live="polite">{failed
      ? <span className="weather-widget weather-widget-fallback">Weather unavailable <button type="button" className="weather-link" onClick={() => { setFailed(false); setRun((value) => value + 1); }}>Retry</button></span>
      : <span className="weather-widget weather-skeleton" aria-label="Loading weather"><span className="weather-skeleton-icon" /><span className="weather-skeleton-line" /><span className="weather-skeleton-line weather-skeleton-short" /></span>}</span>;
  }

  const aqiClass = weather.aqi == null ? "unknown" : weather.aqi <= 50 ? "good" : weather.aqi <= 100 ? "moderate" : "poor";
  return (
    <span className="weather-widget-wrap" ref={wrapRef}>
      <button type="button" className="weather-widget" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((value) => !value)} title={`${place}. Air quality: ${aqiLabel(weather.aqi)}`}>
        <WeatherIcon code={weather.weatherCode} />
        <span className="weather-reading"><strong>{weather.temperature}°C</strong><span>{weatherLabel(weather.weatherCode)}</span></span>
        <span className={`weather-aqi weather-aqi-${aqiClass}`}><b>AQI</b> {weather.aqi == null ? "—" : Math.round(weather.aqi)}<small>{aqiLabel(weather.aqi)}</small></span>
        <span className="weather-location">{weather.city}</span>
      </button>
      {canImprove ? <button type="button" className="weather-link weather-improve" onClick={readPosition}>Improve accuracy</button> : null}
      {open ? (
        <div className="weather-panel" role="dialog" aria-label="Weather and air quality details">
          <div className="weather-panel-head"><strong>{place}</strong><span>{SOURCE_LABEL[weather.source]}</span></div>
          <dl className="weather-panel-grid">
            <div><dt>Temperature</dt><dd>{weather.temperature}°C · {weatherLabel(weather.weatherCode)}</dd></div>
            <div><dt>Air quality (US AQI)</dt><dd>{weather.aqi == null ? "Unavailable" : `${Math.round(weather.aqi)} · ${aqiLabel(weather.aqi)}`}</dd></div>
            {weather.pm25 != null ? <div><dt>PM2.5</dt><dd>{Math.round(weather.pm25)} µg/m³</dd></div> : null}
            <div><dt>Last updated</dt><dd>{new Date(weather.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</dd></div>
          </dl>
          <label className="weather-search"><span>Change city</span><input type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search a city" autoComplete="off" /></label>
          {term.trim().length >= 2 ? (
            <ul className="weather-results">
              {results.map((item) => <li key={`${item.latitude},${item.longitude}`}><button type="button" onClick={() => chooseCity(item)}>{[item.city, item.region, item.country].filter(Boolean).join(", ")}</button></li>)}
              {!results.length ? <li className="weather-results-empty">{searching ? "Searching…" : "No cities found"}</li> : null}
            </ul>
          ) : null}
          <div className="weather-panel-actions">
            {weather.source === "manual" ? <button type="button" className="weather-link" onClick={useAutomatic}>Use automatic location</button> : null}
            {canImprove ? <button type="button" className="weather-link" onClick={readPosition}>Improve accuracy</button> : null}
          </div>
        </div>
      ) : null}
    </span>
  );
}
