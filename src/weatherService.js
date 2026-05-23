const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '6be30ac53e545079d100b632db0bb078';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL  = 'https://api.openweathermap.org/geo/1.0';

export async function resolveLocation(query) {
  if (!query || !query.trim()) throw new Error('Please enter a location.');
  const trimmed = query.trim();

  const coordsMatch = trimmed.match(/^(-?\d{1,3}\.?\d*)\s*,\s*(-?\d{1,3}\.?\d*)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    if (lat < -90 || lat > 90)   throw new Error('Latitude must be between -90 and 90.');
    if (lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180.');
    const res = await fetch(`${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
    await checkStatus(res);
    const data = await res.json();
    const place = data[0] || {};
    return { lat, lon, name: place.name || 'Unknown', country: place.country || '' };
  }

  const zipMatch = trimmed.match(/^\d{4,6}(,\s*[A-Za-z]{2})?$/);
  if (zipMatch) {
    const zip = trimmed.replace(/\s/g, '');
    const zipQuery = zip.includes(',') ? zip : `${zip},IN`;
    const res = await fetch(`${GEO_URL}/zip?zip=${zipQuery}&appid=${API_KEY}`);
    await checkStatus(res);
    const data = await res.json();
    return { lat: data.lat, lon: data.lon, name: data.name, country: data.country };
  }

  const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(trimmed)}&limit=1&appid=${API_KEY}`);
  await checkStatus(res);
  const data = await res.json();
  if (!data.length) throw new Error(`Location "${trimmed}" not found. Try a different name.`);
  const { lat, lon, name, country } = data[0];
  return { lat, lon, name, country };
}

export async function fetchCurrentWeather(lat, lon) {
  const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  await checkStatus(res);
  return res.json();
}

export async function fetchForecast(lat, lon) {
  const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${API_KEY}`);
  await checkStatus(res);
  const data = await res.json();

  const byDay = {};
  data.list.forEach(entry => {
    const date = entry.dt_txt.split(' ')[0];
    const hour = parseInt(entry.dt_txt.split(' ')[1]);
    if (!byDay[date]) {
      byDay[date] = entry;
    } else {
      const prev = parseInt(byDay[date].dt_txt.split(' ')[1]);
      if (Math.abs(hour - 12) < Math.abs(prev - 12)) byDay[date] = entry;
    }
  });
  return Object.values(byDay).slice(0, 5);
}

export function fetchByGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => {
        if (err.code === 1) reject(new Error('Location access denied. Please allow location or type a city.'));
        else reject(new Error('Unable to retrieve your location. Please type a city instead.'));
      }
    );
  });
}

async function checkStatus(res) {
  if (res.ok) return;
  let message = `HTTP ${res.status}`;
  try { const data = await res.json(); message = data.message || message; } catch (_) {}
  if (res.status === 401) throw new Error('Invalid API key. Check your REACT_APP_WEATHER_API_KEY in .env');
  if (res.status === 404) throw new Error('Location not found. Try a different search term.');
  if (res.status === 429) throw new Error('API rate limit exceeded. Please wait a moment and try again.');
  throw new Error(`Weather service error: ${message}`);
}

export function weatherIcon(code) {
  const map = {
    '01d': { emoji: '☀️',  label: 'Clear sky' },
    '01n': { emoji: '🌙',  label: 'Clear night' },
    '02d': { emoji: '⛅',  label: 'Few clouds' },
    '02n': { emoji: '☁️',  label: 'Few clouds' },
    '03d': { emoji: '🌤️', label: 'Scattered clouds' },
    '03n': { emoji: '🌤️', label: 'Scattered clouds' },
    '04d': { emoji: '☁️',  label: 'Overcast' },
    '04n': { emoji: '☁️',  label: 'Overcast' },
    '09d': { emoji: '🌧️', label: 'Shower rain' },
    '09n': { emoji: '🌧️', label: 'Shower rain' },
    '10d': { emoji: '🌦️', label: 'Rain' },
    '10n': { emoji: '🌧️', label: 'Rain' },
    '11d': { emoji: '⛈️', label: 'Thunderstorm' },
    '11n': { emoji: '⛈️', label: 'Thunderstorm' },
    '13d': { emoji: '❄️',  label: 'Snow' },
    '13n': { emoji: '❄️',  label: 'Snow' },
    '50d': { emoji: '🌫️', label: 'Mist / Fog' },
    '50n': { emoji: '🌫️', label: 'Mist / Fog' },
  };
  return map[code] || { emoji: '🌡️', label: 'Weather' };
}

export function formatTime(unix, offsetSecs) {
  const d = new Date((unix + offsetSecs) * 1000);
  return d.toUTCString().slice(17, 22);
}

export function formatDay(dtTxt) {
  const d = new Date(dtTxt);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}