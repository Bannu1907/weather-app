import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-wrap" aria-label="Loading weather data">
      <div className="loader-ring" />
      <span className="loader-text">Fetching weather data…</span>
    </div>
  );
}