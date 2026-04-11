import React, { useState, useEffect, useCallback } from 'react';
import './WeatherWidget.css';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('Kandy');

  // WeatherAPI key - Get from environment variables
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'YOUR_API_KEY';

  const fetchWeatherData = useCallback(async (city = currentCity) => {
    try {
      setLoading(true);
      
      // Check if API key is configured
      if (API_KEY === 'YOUR_API_KEY' || !API_KEY || API_KEY === 'PUT_YOUR_ACTUAL_API_KEY_HERE') {
        console.log('⚠️ WeatherAPI key not configured. Please add your API key to .env file');
        console.log('Get your free API key from: https://www.weatherapi.com/');
        // Set fallback data for demonstration
        setWeatherData({
          location: { name: city },
          current: {
            temp_c: 25,
            feelslike_c: 27,
            humidity: 75,
            condition: {
              text: 'Partly Cloudy (Demo Data)',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
            }
          }
        });
        setError('API key not configured');
        setIsDemoData(true);
        return;
      }
      
      console.log(`🌤️ Fetching real weather data for: ${city}`);
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Weather data not available for ${city}`);
      }
      
      const data = await response.json();
      console.log('✅ Real weather data received:', data);
      setWeatherData(data);
      setError(null);
      setIsDemoData(false);
    } catch (err) {
      setError(err.message);
      console.error('Weather API Error:', err);
      // Set fallback data for demonstration
      setWeatherData({
        location: { name: city },
        current: {
          temp_c: 25,
          feelslike_c: 27,
          humidity: 75,
          condition: {
            text: 'Partly Cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
          }
        }
      });
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [API_KEY, currentCity]); // Dependencies for useCallback

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchCity.trim()) {
      setCurrentCity(searchCity.trim());
      fetchWeatherData(searchCity.trim());
      setSearchCity('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchCity(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handleSearchClick = (e) => {
    e.stopPropagation(); // Prevent closing the widget when clicking on search elements
  };

  if (error) {
    return (
      <div className="weather-widget error">
        <div className="weather-icon-circle">
          <span>⚠️</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`weather-widget ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      {loading ? (
        <div className="weather-icon-circle">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="weather-icon-circle">
            {weatherData?.current?.condition?.icon ? (
              <img 
                src={`https:${weatherData.current.condition.icon}`}
                alt={weatherData.current.condition.text}
                className="weather-icon"
              />
            ) : (
              <span>🌤️</span>
            )}
          </div>
          
          {isExpanded && weatherData && (
            <div className="weather-card" onClick={handleSearchClick}>
              <div className="weather-card-content">
                <div className="search-section">
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                      type="text"
                      value={searchCity}
                      onChange={handleSearchChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Search city..."
                      className="search-input"
                      onClick={handleSearchClick}
                    />
                    <button type="submit" className="search-button" onClick={handleSearchClick}>
                      🔍
                    </button>
                  </form>
                </div>
                
                <div className="city-name">
                  {weatherData.location.name}
                  {isDemoData ? (
                    <span className="demo-badge">Demo - Add API Key</span>
                  ) : (
                    <span className="live-badge">Live Data</span>
                  )}
                </div>
                <div className="temperature">
                  {Math.round(weatherData.current.temp_c)}°C
                </div>
                <div className="condition">
                  {weatherData.current.condition.text}
                </div>
                <div className="weather-details">
                  <div className="detail-item">
                    <span className="detail-label">Feels like:</span>
                    <span className="detail-value">
                      {Math.round(weatherData.current.feelslike_c)}°C
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Humidity:</span>
                    <span className="detail-value">
                      {weatherData.current.humidity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherWidget;