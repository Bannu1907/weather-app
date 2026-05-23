import React from 'react';
import './CurrentWeather.css';
import { weatherIcon, formatTime } from '../weatherService';

export default function CurrentWeather({ data, locationOverride }) {
  const { main, weather, wind, sys, visibility, clouds, timezone, name } = data;
  const desc = weather[0];
  const icon  = weatherIcon(desc.icon);
  const displayName = (locationOverride?.name || name || 'Unknown');
  const country     = locationOverride?.country || sys?.country || '';

  const sunrise = formatTime(sys.sunrise, timezone);
  const sunset  = formatTime(sys.sunset,  timezone);

  const feelsLikeDiff = (main.feels_like - main.temp).toFixed(1);
  const feelsNote = feelsLikeDiff > 1
    ? `Feels warmer (+${feelsLikeDiff}°)`
    : feelsLikeDiff < -1
    ? `Feels cooler (${feelsLikeDiff}°)`
    : 'Feels about right';

  const visKm = visibility ? (visibility / 1000).toFixed(1) : 'N/A';
  const humidity = main.humidity;
  const humidityNote = humidity > 75 ? 'High – expect stickiness'
    : humidity > 50 ? 'Moderate'
    : 'Comfortable – dry air';

  const windKmh = (wind.speed * 3.6).toFixed(1);
  const windDir = degToCompass(wind.deg);

  return (
    <div className="cw-card">
      <div className="cw-top">
        <div className="cw-location">
          <span className="cw-pin">📍</span>
          <span className="cw-city">{displayName}</span>
          {country && <span className="cw-country">{country}</span>}
        </div>
        <div className="cw-datetime">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      <div className="cw-hero">
        <div className="cw-icon-wrap">
          <span className="cw-emoji">{icon.emoji}</span>
        </div>
        <div className="cw-temps">
          <div className="cw-temp-main">{Math.round(main.temp)}<span className="cw-unit">°C</span></div>
          <div className="cw-description">{capitalise(desc.description)}</div>
          <div className="cw-feels">{feelsNote} · {Math.round(main.feels_like)}°C</div>
        </div>
        <div className="cw-minmax">
          <div className="minmax-item">
            <span className="minmax-label">High</span>
            <span className="minmax-val high">{Math.round(main.temp_max)}°</span>
          </div>
          <div className="minmax-divider" />
          <div className="minmax-item">
            <span className="minmax-label">Low</span>
            <span className="minmax-val low">{Math.round(main.temp_min)}°</span>
          </div>
        </div>
      </div>

      <div className="cw-details">
        <DetailCard icon="💧" label="Humidity"    value={`${humidity}%`}        sub={humidityNote} />
        <DetailCard icon="🌬️" label="Wind"        value={`${windKmh} km/h`}     sub={`${windDir} direction`} />
        <DetailCard icon="👁️" label="Visibility"  value={`${visKm} km`}         sub={parseFloat(visKm) > 5 ? 'Good visibility' : 'Limited visibility'} />
        <DetailCard icon="☁️" label="Cloud Cover" value={`${clouds?.all ?? '—'}%`} sub={clouds?.all > 75 ? 'Overcast' : clouds?.all > 25 ? 'Partly cloudy' : 'Mostly clear'} />
        <DetailCard icon="🌅" label="Sunrise"     value={sunrise}               sub="Local time" />
        <DetailCard icon="🌇" label="Sunset"      value={sunset}                sub="Local time" />
        <DetailCard icon="📊" label="Pressure"    value={`${main.pressure} hPa`} sub={main.pressure > 1013 ? 'High pressure' : 'Low pressure'} />
        <DetailCard icon="🌡️" label="Dew Point"  value={`${dewPoint(main.temp, humidity)}°C`} sub="Moisture in air" />
      </div>

      <TravelTips data={{ main, wind, weather }} />
    </div>
  );
}

function DetailCard({ icon, label, value, sub }) {
  return (
    <div className="detail-card">
      <span className="detail-icon">{icon}</span>
      <div className="detail-body">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
        <span className="detail-sub">{sub}</span>
      </div>
    </div>
  );
}

function TravelTips({ data }) {
  const tips = [];
  const { main, wind, weather } = data;
  const wid = weather[0].id;
  const temp = main.temp;
  const hum  = main.humidity;
  const windKmh = wind.speed * 3.6;

  if (temp < 10)  tips.push('🧥 Bundle up — it\'s cold. Layering is key.');
  if (temp > 35)  tips.push('🥵 Extreme heat. Stay hydrated and avoid direct sun midday.');
  if (temp > 28 && hum > 70) tips.push('💦 High heat + high humidity. Heat index feels much hotter.');
  if (wid >= 200 && wid < 300) tips.push('⛈️ Thunderstorms present — avoid open areas and tall trees.');
  if (wid >= 300 && wid < 600) tips.push('☂️ Bring an umbrella — rain is likely.');
  if (wid >= 600 && wid < 700) tips.push('❄️ Snow conditions — allow extra travel time, wear boots.');
  if (wid >= 700 && wid < 800) tips.push('🌫️ Reduced visibility due to fog/mist — drive carefully.');
  if (windKmh > 50)            tips.push('🌀 Strong winds — secure loose objects and be careful outdoors.');
  if (windKmh > 20)            tips.push('💨 Breezy conditions — good drying weather for laundry!');
  if (main.humidity < 30)      tips.push('🏜️ Very dry air — stay hydrated and moisturise skin.');
  if (tips.length === 0)       tips.push('✅ Comfortable conditions — great weather for outdoor activities!');

  return (
    <div className="travel-tips">
      <div className="tips-header">💡 Travel Insights</div>
      <ul className="tips-list">
        {tips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>
    </div>
  );
}

function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function degToCompass(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function dewPoint(tempC, humidity) {
  const a = 17.27, b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return ((b * alpha) / (a - alpha)).toFixed(1);
}