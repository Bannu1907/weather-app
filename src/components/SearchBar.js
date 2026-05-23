import React, { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onGeolocate, loading }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="search-wrapper">
      <form className={`search-form ${focused ? 'focused' : ''}`} onSubmit={handleSubmit}>
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          type="text"
          placeholder="City, zip code, GPS coords, or landmark…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
          aria-label="Search location"
        />
        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="search-btn"
          disabled={loading || !query.trim()}
          aria-label="Search"
        >
          {loading ? <span className="btn-spinner" /> : 'Search'}
        </button>
      </form>
      <button
        className="geo-btn"
        onClick={onGeolocate}
        disabled={loading}
        aria-label="Use my location"
      >
        <span className="geo-icon">◎</span>
        Use My Location
      </button>
    </div>
  );
}