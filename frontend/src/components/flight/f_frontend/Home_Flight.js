import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeFlight.css";

// Flight Ribbon component (for icon ribbon on each card)
function FlightRibbon() {
  return (
    <div className="flight-ribbon" title="Flight">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-label="Flight"
      >
        <path d="M21 16v-2l-8-5V4.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1v1l3-.5 3 .5v-1l-2-1v-5.5l8 2.5z" />
      </svg>
    </div>
  );
}

export default function HomeFlight() {
  // Data
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI + filters
  const [filters, setFilters] = useState({
    departure: "",
    destination: "",
    description: "",
    date: "",
  });

  const [cabinClasses, setCabinClasses] = useState([
    "Economy",
    "Business",
    "First",
  ]);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [adults, setAdults] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-us");
  const [tripType, setTripType] = useState("one-way");
  const [sortBy, setSortBy] = useState("relevance");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("hf_theme");
    if (stored) return stored;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const navigate = useNavigate();

  // Persist preferences
  useEffect(() => {
    const saved = localStorage.getItem("hf_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.filters) setFilters((f) => ({ ...f, ...parsed.filters }));
        if (parsed.cabinClass) setCabinClass(parsed.cabinClass);
        if (parsed.adults) setAdults(parsed.adults);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.locale) setLocale(parsed.locale);
        if (parsed.tripType) setTripType(parsed.tripType);
        if (parsed.sortBy) setSortBy(parsed.sortBy);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "hf_prefs",
      JSON.stringify({
        filters,
        cabinClass,
        adults,
        currency,
        locale,
        tripType,
        sortBy,
      })
    );
  }, [filters, cabinClass, adults, currency, locale, tripType, sortBy]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("hf_theme", theme);
  }, [theme]);

  async function fetchFlights() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.departure) params.append("departure", filters.departure);
      if (filters.destination) params.append("destination", filters.destination);
      if (filters.description) params.append("description", filters.description);
      if (filters.date) params.append("date", filters.date);

      const res = await fetch(
        `http://localhost:5000/api/flights?${params.toString()}`
      );
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setFlights(data.flights || []);
    } catch (e) {
      console.error(e);
      setError("Could not load flights. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCabinClasses() {
    try {
      const res = await fetch("http://localhost:5000/api/flights/cabin-classes");
      if (!res.ok) throw new Error("Failed to load cabin classes");
      const data = await res.json();
      setCabinClasses(data.cabinClasses || ["Economy", "Business", "First"]);
    } catch {
      setCabinClasses(["Economy", "Business", "First"]);
    }
  }

  useEffect(() => {
    fetchCabinClasses();
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchFlights();
  }

  function handleBook(flight) {
    navigate(`/flights/book/${flight._id}`, {
      state: {
        selectedDate: filters.date,
        cabinClass,
        adults,
        currency,
        locale,
        tripType,
      },
    });
  }

  function handleSwap() {
    setFilters(({ departure, destination, ...rest }) => ({
      ...rest,
      departure: destination,
      destination: departure,
      description: filters.description,
      date: filters.date,
    }));
  }

  function handleClear() {
    setFilters({ departure: "", destination: "", description: "", date: "" });
  }

  function incAdults() {
    setAdults((n) => Math.min(n + 1, 8));
  }
  function decAdults() {
    setAdults((n) => Math.max(n - 1, 1));
  }

  function todayYYYYMMDD() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const sortedFlights = useMemo(() => {
    // Filter flights where both departure and destination match user input
    const sameLocationFlights = flights.filter(
      (flight) =>
        (!filters.departure ||
          flight.departure
            .toLowerCase()
            .includes(filters.departure.toLowerCase())) &&
        (!filters.destination ||
          flight.destination
            .toLowerCase()
            .includes(filters.destination.toLowerCase()))
    );

    const list = [...sameLocationFlights];

    if (sortBy === "route-az") {
      return list.sort((a, b) =>
        `${a.departure} ${a.destination}`.localeCompare(
          `${b.departure} ${b.destination}`
        )
      );
    }

    if (sortBy === "route-za") {
      return list.sort((a, b) =>
        `${b.departure} ${b.destination}`.localeCompare(
          `${a.departure} ${a.destination}`
        )
      );
    }

    return list; // relevance (as returned by API)
  }, [flights, sortBy, filters.departure, filters.destination]);

  const quickPicks = [
    { from: "Singapore", to: "Colombo" },
    { from: "Dubai", to: "Colombo" },
    { from: "Bangkok", to: "Colombo" },
    { from: "Sydney", to: "Colombo" },
    { from: "London", to: "Colombo" },
  ];

  function AdBanner({ image, link, alt }) {
    return (
      <div className="ad-banner">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img src={image} alt={alt} />
        </a>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Top bar */}
      <div className="top-bar">
        <div className="topbar-right">
          <div className="inline-field">
            <label htmlFor="currency">Currency</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="LKR">LKR</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div className="inline-field">
            <label htmlFor="locale">Language</label>
            <select id="locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="en-us">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <section className="search-section">
        <form className="search-form" onSubmit={handleSearch}>
          {/* Trip type & class row */}
          <div className="search-options" role="group" aria-label="Trip options">
            <label className="radio">
              <input
                type="radio"
                name="trip"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={(e) => setTripType(e.target.value)}
              />
              Round-trip
            </label>
            <label className="radio">
              <input
                type="radio"
                name="trip"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={(e) => setTripType(e.target.value)}
              />
              One-way
            </label>
            <label className="radio">
              <input
                type="radio"
                name="trip"
                value="multi-city"
                checked={tripType === "multi-city"}
                onChange={(e) => setTripType(e.target.value)}
              />
              Multi-city
            </label>

            <div className="spacer" />
            <div className="inline-field">
              <label htmlFor="cabin">Cabin class</label>
              <select
                id="cabin"
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
              >
                {cabinClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-field">
              <label htmlFor="adults">Passengers</label>
              <div className="qty-control" aria-label="Adults">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={decAdults}
                  aria-label="Decrease adults"
                >
                  −
                </button>
                <input
                  id="adults"
                  type="text"
                  inputMode="numeric"
                  value={`${adults} Adult${adults > 1 ? "s" : ""}`}
                  readOnly
                  aria-live="polite"
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={incAdults}
                  aria-label="Increase adults"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Fields row */}
          <div className="search-fields">
            <div className="field">
              <label htmlFor="departure">Leaving from</label>
              <input
                id="departure"
                name="departure"
                list="airports"
                placeholder="e.g. Colombo (CMB)"
                value={filters.departure}
                onChange={handleFilterChange}
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={handleSwap}
              aria-label="Swap departure and destination"
              title="Swap"
            >
              ⇄
            </button>

            <div className="field">
              <label htmlFor="destination">Going to</label>
              <input
                id="destination"
                name="destination"
                list="airports"
                placeholder="e.g. Dubai (DXB)"
                value={filters.destination}
                onChange={handleFilterChange}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayYYYYMMDD()}
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="field">
              <label htmlFor="description">Keyword</label>
              <input
                id="description"
                name="description"
                placeholder="Travel locations"
                value={filters.description}
                onChange={handleFilterChange}
              />
            </div>

            <div className="field actions">
              <button type="submit" className="search-btn">
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                className="clear-btn"
                onClick={handleClear}
                disabled={loading}
                title="Clear all filters"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick picks */}
          <div className="chips">
            <span className="chips-title">Quick picks:</span>
            {quickPicks.map((q, i) => (
              <button
                type="button"
                key={i}
                className="chip"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    departure: q.from,
                    destination: q.to,
                  }))
                }
              >
                {q.from.split(" ")[0]} → {q.to.split(" ")[0]}
              </button>
            ))}
          </div>

          <datalist id="airports">
            <option value="Colombo (CMB)" />
            <option value="Dubai (DXB)" />
            <option value="Doha (DOH)" />
            <option value="Singapore (SIN)" />
            <option value="London (LHR)" />
            <option value="New York (JFK)" />
            <option value="Chennai (MAA)" />
            <option value="Malé (MLE)" />
            <option value="Bangkok (BKK, DMK)" />
            <option value="Shanghai (PVG)" />
            <option value="Doha (DOH)" />
            <option value="Sydney (SYD)" />
            <option value="Tokyo (NRT)" />
          </datalist>
        </form>
      </section>

      {/* Results toolbar */}
      <section className="results-section">
        <div className="toolbar">
          <div className="result-meta">
            <h2>Available Flights</h2>
            {!loading && !error && (
              <span className="count">Showing {sortedFlights.length}</span>
            )}
          </div>
          <div className="inline-field">
            <label htmlFor="sortBy">Sort by</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="route-az">Route A → Z</option>
              <option value="route-za">Route Z → A</option>
            </select>
          </div>
        </div>

        {error && <div className="notice error">{error}</div>}

        {/* Skeletons */}
        {loading && (
          <div className="flight-card-list">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="flight-card skeleton-card" key={i}>
                <div className="flight-img-wrapper skeleton-bg" />
                <div className="flight-card-body">
                  <div className="skeleton-line w-60" />
                  <div className="skeleton-line w-90" />
                  <div className="skeleton-line w-40" />
                  <div className="skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && sortedFlights.length === 0 && (
          <div className="empty-state">
            <p className="no-results">No flights found. Try adjusting your search.</p>
            <div className="chips">
              <span className="chips-title">Try:</span>
              <button
                type="button"
                className="chip"
                onClick={() =>
                  setFilters((f) => ({ ...f, date: "" }))
                }
              >
                Any date
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => setFilters({ departure: "", destination: "", description: "", date: "" })}
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {!loading && !error && sortedFlights.length > 0 && (
          <div className="flight-card-list">
            {sortedFlights.map((flight) => (
              <div className="flight-card" key={flight._id}>
                <FlightRibbon />
                <div className="flight-img-wrapper">
                  <img
                    src={flight.airlineCoverImage || "/default-plane.jpg"}
                    alt={`${flight.departure} to ${flight.destination}`}
                    onError={(e) => {
                      e.currentTarget.src = "/default-plane.jpg";
                    }}
                  />
                </div>
                <div className="flight-card-body">
                  <h3 className="flight-route">
                    {flight.departure} <span className="arrow">→</span> {flight.destination}
                  </h3>

                  {filters.date && (
                    <p className="flight-date">Date: {filters.date}</p>
                  )}

                  <p className="flight-description">
                    {flight.description || <span className="muted">No description</span>}
                  </p>

                  <button className="flight-card-btn" onClick={() => handleBook(flight)}>
                    Find Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}