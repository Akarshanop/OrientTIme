import { useState, useEffect } from "react";
import "../styles/weather.css"; // Import the new CSS file

// Helper function to get a weather icon based on conditions
const getWeatherIcon = (temp, rain, wind) => {
    if (rain > 0.5) return "🌧️"; // Rainy
    if (wind > 15) return "💨"; // Windy
    if (temp > 30) return "☀️"; // Sunny/Hot
    if (temp < 10) return "❄️"; // Cold
    return "☁️"; // Default cloudy/mild
};

function Weather() {
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Using your provided API URL for Delhi, India
        const url = "https://api.open-meteo.com/v1/forecast?latitude=28.62&longitude=77.21&hourly=temperature_2m,rain,wind_speed_10m,precipitation_probability&current_weather=true";

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setWeatherData(data);
            })
            .catch(err => {
                console.error("Error fetching weather:", err);
                setError(err.message);
            });
    }, []);

    if (error) return (
        <div className="weather-container error">Failed to load weather data.</div>
    );
    if (!weatherData) return (
        <div className="weather-container loading">Loading Weather...</div>
    );

    // Find the index of the current hour in the hourly forecast
    const now = new Date();
    const currentIndex = weatherData.hourly.time.findIndex(t => t.startsWith(now.toISOString().slice(0, 13)));

    const currentHourData = {
        time: weatherData.hourly.time[currentIndex],
        temp: weatherData.hourly.temperature_2m[currentIndex],
        rain: weatherData.hourly.rain[currentIndex],
        wind: weatherData.hourly.wind_speed_10m[currentIndex],
        pop: weatherData.hourly.precipitation_probability[currentIndex],
    };

    return (
        <div className="weather-container">
            <div className="current-weather-card">
                <div className="current-location">New Delhi</div>
                <div className="current-temp">{Math.round(weatherData.current_weather.temperature)}°C</div>
                <div className="current-condition">
                    {getWeatherIcon(currentHourData.temp, currentHourData.rain, currentHourData.wind)}
                    <span>Wind: {weatherData.current_weather.windspeed} km/h</span>
                </div>
            </div>

            <div className="hourly-forecast-container">
                <div className="forecast-header">Hourly Forecast</div>
                <div className="hourly-list">
                    {weatherData.hourly.time.slice(currentIndex, currentIndex + 24).map((time, idx) => {
                        const temp = weatherData.hourly.temperature_2m[currentIndex + idx];
                        const rain = weatherData.hourly.rain[currentIndex + idx];
                        const wind = weatherData.hourly.wind_speed_10m[currentIndex + idx];
                        
                        return (
                            <div key={time} className="hourly-item">
                                <span className="hour-time">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="hour-icon">{getWeatherIcon(temp, rain, wind)}</span>
                                <span className="hour-temp">{Math.round(temp)}°C</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Weather;
