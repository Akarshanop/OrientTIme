// components/weather.jsx
import { useState, useEffect } from "react";
import "../styles/weather.css";
import { speak, stopSpeaking, initVoices } from "../utils/tts.js";

const getWeatherIcon = (temp, rain, wind) => {
  if (rain > 0.5) return "🌧️";
  if (wind > 15) return "💨";
  if (temp > 30) return "☀️";
  if (temp < 10) return "❄️";
  return "☁️";
};

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Your Location");

  useEffect(() => {
    initVoices();
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    // 1. Get user’s current coordinates
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Optional: fetch city name from reverse geocoding
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const geoData = await geoRes.json();
          if (geoData.address?.city || geoData.address?.town) {
            setCity(geoData.address.city || geoData.address.town);
          }
        } catch {
          setCity("Your Location");
        }

        // 2. Fetch weather from Open-Meteo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain,wind_speed_10m,precipitation_probability&current_weather=true`;

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setWeatherData(data);

          const now = new Date();
          const hourKey = now.toISOString().slice(0, 13);
          let idx = data.hourly.time.findIndex((t) => t.startsWith(hourKey));
          if (idx === -1) {
            idx = data.hourly.time.findIndex((t) => new Date(t) >= now);
            if (idx === -1) idx = 0;
          }

          const payload = {
            city,
            temp: Math.round(data.hourly.temperature_2m[idx]),
            feelsLike: Math.round(data.current_weather.temperature),
            condition: "Clear", // Open-Meteo lacks descriptive condition
            pop: data.hourly.precipitation_probability[idx] ?? 0,
            wind: Math.round(data.current_weather.windspeed), // km/h
          };

          // 3. Ask your AI proxy for summary
          const r = await fetch("/ai/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weather: payload }),
          });

          if (!r.ok) throw new Error("AI summary failed");
          const { summary: s } = await r.json();
          setSummary(s);

          // 4. Speak it
          speak(s, {
            rate: 1,
            pitch: 1,
            preferLocales: ["en-IN", "en-GB", "en-US"],
          });
        } catch (err) {
          setError(err.message);
        }
      },
      (err) => {
        setError("Location access denied. Please allow location.");
      }
    );
  }, [city]);

  if (error) return <div className="weather-container error">{error}</div>;
  if (!weatherData)
    return <div className="weather-container loading">Loading Weather...</div>;

  const now = new Date();
  const hourKey = now.toISOString().slice(0, 13);
  let currentIndex = weatherData.hourly.time.findIndex((t) =>
    t.startsWith(hourKey)
  );
  if (currentIndex === -1) {
    currentIndex = weatherData.hourly.time.findIndex(
      (t) => new Date(t) >= now
    );
    if (currentIndex === -1) currentIndex = 0;
  }

  const currentHourData = {
    time: weatherData.hourly.time[currentIndex],
    temp: weatherData.hourly.temperature_2m[currentIndex],
    rain: weatherData.hourly.rain[currentIndex],
    wind: weatherData.hourly.wind_speed_10m[currentIndex],
    pop: weatherData.hourly.precipitation_probability[currentIndex],
  };

  return (
    <div className="weather-container" aria-label="Weather screen">
      <div className="current-weather-card">
        <div className="current-location">{city}</div>
        <div className="current-temp">
          {Math.round(weatherData.current_weather.temperature)}°C
        </div>
        <div className="current-condition">
          {getWeatherIcon(
            currentHourData.temp,
            currentHourData.rain,
            currentHourData.wind
          )}
          <span>
            Wind: {Math.round(weatherData.current_weather.windspeed)} km/h
          </span>
        </div>
        {summary && <div className="ai-summary">{summary}</div>}
        <div className="tts-controls">
          <button
            className="tts-btn"
            onClick={() =>
              speak(summary, {
                rate: 1,
                pitch: 1,
                preferLocales: ["en-IN", "en-GB", "en-US"],
              })
            }
            disabled={!summary}
          >
            🔊 Speak
          </button>
          <button className="tts-btn" onClick={stopSpeaking}>
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default Weather;
