# 🌤️ GET REAL WEATHER DATA - Quick Setup Guide

## 📍 **Current Status**: Showing Demo Data
You're currently seeing demo data because no API key is configured.

## 🚀 **3 Simple Steps to Get Real Weather Data:**

### Step 1: Get FREE API Key (2 minutes)
1. Go to: https://www.weatherapi.com/
2. Click "Sign Up Free"
3. Create account (no credit card needed)
4. Go to dashboard and copy your API key

### Step 2: Add API Key to .env File
1. Open: `frontend/.env`
2. Replace: `REACT_APP_WEATHER_API_KEY=PUT_YOUR_ACTUAL_API_KEY_HERE`
3. With: `REACT_APP_WEATHER_API_KEY=your_actual_key_here`

### Step 3: Restart Server
```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

## ✅ **How to Verify It's Working:**
- Widget will show "Live Data" badge instead of "Demo - Add API Key"
- Console will show: "🌤️ Fetching real weather data for: [city]"
- Weather data will be real and current

## 🌍 **Test These Cities:**
- Kandy, Sri Lanka
- Colombo, Sri Lanka  
- London, UK
- New York, USA
- Tokyo, Japan

## 🔧 **Troubleshooting:**
If still showing demo data:
1. Check `.env` file has correct API key
2. Restart the development server
3. Check browser console for errors
4. Verify API key is active on WeatherAPI.com

## 📞 **Free Plan Limits:**
- 1,000,000 calls/month
- Perfect for development and small apps
- No credit card required

---
**Need help?** Check the browser console for detailed logs!