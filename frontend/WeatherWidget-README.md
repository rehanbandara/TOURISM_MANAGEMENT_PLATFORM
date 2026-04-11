# WeatherWidget Setup Instructions

## Overview
The WeatherWidget is a floating weather component that appears in the bottom-right corner of all pages in your tourism application. It shows current weather information for Kandy, Sri Lanka.

## Features
- ✅ Floating circular icon in bottom-right corner
- ✅ Glassmorphism design with blur effects
- ✅ Smooth animations and hover effects
- ✅ Expandable weather card on hover/click
- ✅ Shows temperature, condition, humidity, and "feels like" temperature
- ✅ Loading spinner while fetching data
- ✅ Error handling with fallback data
- ✅ Responsive design for mobile devices
- ✅ Accessibility features

## Setup Instructions

### 1. Get WeatherAPI Key
1. Visit [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env` in the frontend directory:
   ```powershell
   cp .env.example .env
   ```

2. Edit `.env` and replace `YOUR_API_KEY` with your actual WeatherAPI key:
   ```
   REACT_APP_WEATHER_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Development Server
After adding the API key, restart your React development server:
```powershell
npm start
```

## Files Created/Modified

### New Files:
- `src/Components/WeatherWidget.js` - Main component
- `src/Components/WeatherWidget.css` - Styling with glassmorphism effects
- `.env.example` - Environment variable template

### Modified Files:
- `src/App.js` - Added WeatherWidget import and component

## Customization Options

### Change Location
Edit the `CITY` variable in `WeatherWidget.js`:
```javascript
const CITY = 'Colombo'; // Change to any Sri Lankan city
```

### Styling
Modify `WeatherWidget.css` to customize:
- Colors and gradients
- Size and position
- Animation effects
- Glassmorphism intensity

### Position
Change the position by modifying CSS:
```css
.weather-widget {
  bottom: 20px;    /* Distance from bottom */
  right: 20px;     /* Distance from right */
  left: 20px;      /* Use this for left positioning */
}
```

## Troubleshooting

### Widget not showing weather data:
1. Check if API key is correctly set in `.env`
2. Verify internet connection
3. Check browser console for errors
4. The widget will show fallback data if API fails

### Styling issues:
1. Clear browser cache
2. Check if CSS file is properly imported
3. Verify no conflicting styles in other CSS files

## Browser Support
- Modern browsers with backdrop-filter support
- Fallback styles for older browsers
- Responsive design for mobile devices

## Notes
- The widget appears on all pages automatically
- Weather data is fetched once when the component loads
- API calls are minimal to respect rate limits
- Component uses React hooks for state management