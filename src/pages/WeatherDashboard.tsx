import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CloudSun, 
  Droplet, 
  Wind, 
  Thermometer, 
  Gauge, 
  CloudRain, 
  Sun, 
  Cloud, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  Info,
  Waves
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge.js';
import type { MicroClimateRecord, WeatherForecastDay, AgriRiskAlert } from '../types/weather.js';

export const WeatherDashboard: React.FC = () => {
  const [citiesData, setCitiesData] = useState<any[]>([]);
  const [selectedCityName, setSelectedCityName] = useState<string>('Hyderabad');
  const [alerts, setAlerts] = useState<AgriRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        const res = await axios.get('/api/weather');
        if (res.data?.success && res.data?.data) {
          setCitiesData(res.data.data.cities || []);
          setAlerts(res.data.data.alerts || []);
          if (res.data.data.cities?.length > 0) {
            setSelectedCityName(res.data.data.cities[0].city);
          }
        }
      } catch (err) {
        console.error('Weather load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWeatherData();
  }, []);

  const activeCityObj = citiesData.find(c => c.city === selectedCityName) || citiesData[0];
  const current: MicroClimateRecord = activeCityObj?.current || {
    date: '2024-01-01',
    city: 'Hyderabad',
    state: 'Telangana',
    tempMax: 38,
    tempMin: 26,
    tempAvg: 32,
    humidity: 78,
    rainfall: 12.5,
    windSpeed: 14,
    aqi: 110,
    aqiCategory: 'Moderate',
    pressure: 1008,
    cloudCover: 55,
    soilMoisture: 52
  };
  const forecast: WeatherForecastDay[] = activeCityObj?.forecast || [];

  // Filter alerts relevant to this city or state
  const cityAlerts = alerts.filter(a => 
    a.location.toLowerCase().includes(current.city.toLowerCase()) ||
    a.location.toLowerCase().includes(current.state.toLowerCase())
  );

  // Weather icon helper
  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain': return <CloudRain className="w-6 h-6 text-sky-400" />;
      case 'CloudDrizzle': return <CloudRain className="w-6 h-6 text-teal-400" />;
      case 'Cloud': return <Cloud className="w-6 h-6 text-slate-300" />;
      case 'Flame': return <Sun className="w-6 h-6 text-amber-500 animate-pulse" />;
      default: return <Sun className="w-6 h-6 text-amber-400" />;
    }
  };

  const soilMoistureCategory = (val: number) => {
    if (val >= 75) return { label: 'Waterlogged / Excessive', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30', advice: 'Open drainage ditches immediately to prevent root collar rot.' };
    if (val >= 40) return { label: 'Optimal Root Zone Moisture', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', advice: 'Soil moisture is at ideal field capacity for nutrient uptake.' };
    if (val >= 25) return { label: 'Moderate Moisture Deficit', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', advice: 'Schedule light drip or furrow irrigation within 24-36 hours.' };
    return { label: 'Critical Wilting Point', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30', advice: 'Immediate deep irrigation required to avoid crop stunting.' };
  };

  const moistureInfo = soilMoistureCategory(current.soilMoisture);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & City Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Micro-Climate Station & Early Warning
            </h1>
            <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-semibold">
              Live Feed
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Indian micro-climate metrics, 0-10cm root zone soil moisture, and predictive pathogen/pest alerts.
          </p>
        </div>

        {/* City Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-400 uppercase">Region / Mandi Zone:</label>
          <select
            value={selectedCityName}
            onChange={(e) => setSelectedCityName(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {citiesData.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city}, {c.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Micro-climate & Soil Moisture Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sensor Metrics Grid */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 text-sky-400 border border-sky-500/30">
                <CloudSun className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{current.city}, {current.state}</h2>
                <p className="text-xs text-slate-400">Recorded: {current.date} • Micro-Station Active</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white">{current.tempAvg}°C</div>
              <p className="text-xs text-slate-400">High: {current.tempMax}°C • Low: {current.tempMin}°C</p>
            </div>
          </div>

          {/* 6 Sensor Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-xl font-bold text-white">{current.humidity}%</div>
              <p className="text-[11px] text-slate-400">
                {current.humidity > 80 ? '⚠️ High fungal risk' : 'Normal range'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-teal-400" />
                <span>24h Precipitation</span>
              </div>
              <div className="text-xl font-bold text-white">{current.rainfall} mm</div>
              <p className="text-[11px] text-slate-400">
                {current.rainfall > 25 ? '⚠️ Drainage required' : current.rainfall > 0 ? 'Light rain' : 'Dry'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-xl font-bold text-white">{current.windSpeed} km/h</div>
              <p className="text-[11px] text-slate-400">
                {current.windSpeed > 22 ? 'Moderate Gusts' : 'Gentle Breeze'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span>Barometric Pressure</span>
              </div>
              <div className="text-xl font-bold text-white">{current.pressure} hPa</div>
              <p className="text-[11px] text-slate-400">Atmospheric gradient</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Cloud className="w-3.5 h-3.5 text-slate-400" />
                <span>Cloud Cover</span>
              </div>
              <div className="text-xl font-bold text-white">{current.cloudCover}%</div>
              <p className="text-[11px] text-slate-400">
                {current.cloudCover > 60 ? 'Overcast sky' : 'High solar flux'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Air Quality Index</span>
              </div>
              <div className="text-xl font-bold text-white">{current.aqi}</div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {current.aqiCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Soil Moisture Gauge (0-10cm) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Waves className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Root-Zone Soil Moisture</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">0-10cm Depth</span>
            </div>

            {/* Circular / Visual Gauge */}
            <div className="my-6 text-center space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * current.soilMoisture) / 100}
                    strokeLinecap="round"
                    className={current.soilMoisture > 75 ? "text-rose-500 transition-all duration-1000" : current.soilMoisture < 30 ? "text-amber-500 transition-all duration-1000" : "text-emerald-500 transition-all duration-1000"}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{current.soilMoisture}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Moisture</span>
                </div>
              </div>

              <div className={`mt-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${moistureInfo.bg} ${moistureInfo.color}`}>
                {moistureInfo.label}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              💡 <span className="font-semibold text-slate-200">Agronomist Recommendation:</span> {moistureInfo.advice}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
            Infiltration calculated based on precipitation absorption and evaporative transpiration flux.
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">7-Day Micro-Climate Trend Forecast</h2>
          <span className="text-xs text-slate-400">Daily temperature curves & root moisture anticipation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((f, idx) => (
            <div
              key={f.date || idx}
              className={`glass-card rounded-2xl p-4 border text-center space-y-3 transition-transform hover:-translate-y-1 ${
                idx === 0 ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-slate-300">
                {idx === 0 ? 'Today' : f.dayOfWeek}
              </div>
              <div className="text-[10px] text-slate-400">{f.date}</div>

              <div className="flex justify-center py-1">
                {renderWeatherIcon(f.iconName)}
              </div>

              <div className="text-xs font-medium text-slate-200">{f.condition}</div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">
                  {f.tempMax}° <span className="text-slate-400 font-normal">/ {f.tempMin}°</span>
                </div>
                <div className="text-[11px] text-sky-400 flex items-center justify-center space-x-1">
                  <CloudRain className="w-3 h-3" />
                  <span>{f.rainfall}mm</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Soil: {f.soilMoisture}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agri Risk Warning Indicators Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Predictive Agronomic Risk Warnings ({alerts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Ground-truth triggered by micro-climate sensor thresholds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RiskBadge severity={alert.severity} />
                    <span className="text-xs text-slate-400 font-medium">{alert.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{alert.title}</h3>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">{alert.issuedAt}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

              {/* Actionable Advice List */}
              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Farmer Actions:
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {alert.actionableAdvice.map((advice, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div>
                  <span className="font-semibold text-slate-300">Vulnerable Crops: </span>
                  {alert.affectedCrops.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
