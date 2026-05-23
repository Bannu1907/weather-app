import React, { useState, useCallback } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastRow from './components/ForecastRow';
import ErrorBanner from './components/ErrorBanner';
import Loader from './components/Loader';
import Footer from './components/Footer';
import {
  resolveLocation,
  fetchCurrentWeather,
  fetchForecast,
  fetchByGeolocation,
} from './weatherService';

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [current, setCurrent]   = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState(null);

  const loadWeather = useCallback(async (lat, lon, locInfo) => {
    setLoading(true);
    setError(null);
    try {
      const [cur, fore] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
      ]);
      setCurrent(cur);
      setForecast(fore);
      setLocation(locInfo);
    } catch (err) {
      setError(err.message);
      setCurrent(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const loc = await resolveLocation(query);
      await loadWeather(loc.lat, loc.lon, loc);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [loadWeather]);

  const handleGeolocate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = await fetchByGeolocation();
      const locInfo = { lat, lon, name: null, country: null };
      await loadWeather(lat, lon, locInfo);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [loadWeather]);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-group">
            <span className="logo-icon">◈</span>
            <span className="logo-text">WeatherScope</span>
          </div>
          <span className="header-tagline">Real-time atmospheric intelligence</span>
        </div>
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} onGeolocate={handleGeolocate} loading={loading} />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {loading && <Loader />}

        {!loading && current && (
          <div className="results-wrap">
            <CurrentWeather data={current} locationOverride={location} />
            {forecast.length > 0 && (
              <section className="forecast-section">
                <h2 className="section-title">
                  <span className="title-accent">5-Day</span> Forecast
                </h2>
                <ForecastRow forecast={forecast} />
              </section>
            )}
          </div>
        )}

        {!loading && !current && !error && (
          <div className="empty-state">
            <div className="empty-globe">🌐</div>
            <p className="empty-title">Search any city, zip code, or landmark</p>
            <p className="empty-sub">Or tap <strong>Use My Location</strong> for instant local weather</p>
            <div className="empty-hints">
              <span>Try: "Mumbai"</span>
              <span>Try: "10001"</span>
              <span>Try: "Eiffel Tower"</span>
              <span>Try: "28.6139, 77.2090"</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}