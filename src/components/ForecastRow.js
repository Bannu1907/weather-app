import React from 'react';
import './ForecastRow.css';
import { weatherIcon, formatDay } from '../weatherService';

export default function ForecastRow({ forecast }) {
  const allTemps = forecast.flatMap(d => [d.main.temp_min, d.main.temp_max]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const range = globalMax - globalMin || 1;

  return (
    <div className="forecast-grid">
      {forecast.map((day, i) => {
        const icon   = weatherIcon(day.weather[0].icon);
        const label  = formatDay(day.dt_txt);
        const hi     = Math.round(day.main.temp_max);
        const lo     = Math.round(day.main.temp_min);
        const barStart = ((day.main.temp_min - globalMin) / range) * 100;
        const barWidth = ((day.main.temp_max - day.main.temp_min) / range) * 100;
        const pop      = day.pop !== undefined ? Math.round(day.pop * 100) : null;

        return (
          <div className="fc-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="fc-day">{i === 0 ? 'Today' : label.split(',')[0]}</div>
            <div className="fc-date">{label.split(',')[1]?.trim()}</div>
            <div className="fc-icon">{icon.emoji}</div>
            <div className="fc-desc">{icon.label}</div>
            {pop !== null && (
              <div className="fc-pop">
                <span className="pop-icon">💧</span>{pop}%
              </div>
            )}
            <div className="fc-temps">
              <span className="fc-hi">{hi}°</span>
              <span className="fc-lo">{lo}°</span>
            </div>
            <div className="fc-bar-wrap">
              <div className="fc-bar-track">
                <div
                  className="fc-bar-fill"
                  style={{
                    left: `${barStart}%`,
                    width: `${Math.max(barWidth, 15)}%`,
                  }}
                />
              </div>
            </div>
            <div className="fc-extra">
              <span>💨 {(day.wind.speed * 3.6).toFixed(0)} km/h</span>
              <span>💧 {day.main.humidity}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}