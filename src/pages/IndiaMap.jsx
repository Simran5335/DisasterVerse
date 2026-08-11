import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/IndiaMap.css';

import { DISASTER_PROFILES as BASE_DISASTER_PROFILES, REGION_PROFILES } from '../data/indiaDisasterMapData';

const INDIA_CENTER = [22.7, 80.2];

const EXTRA_HAZARD_PROFILES = {
  landslide: { id: 'landslide', name: 'Landslide', icon: 'mountain' },
  drought: { id: 'drought', name: 'Drought', icon: 'sun' },
  wildfire: { id: 'wildfire', name: 'Forest Fire', icon: 'fire' },
  'severe-storm': { id: 'severe-storm', name: 'Severe Storm', icon: 'storm' },
  'chemical-emergency': { id: 'chemical-emergency', name: 'Chemical Hazard', icon: 'chemical' },
};

const DISASTER_PROFILES = { ...BASE_DISASTER_PROFILES, ...EXTRA_HAZARD_PROFILES };

const HAZARDS = [
  { id: 'all', label: 'All Hazards', icon: '◈' },
  { id: 'flood', label: 'Flood', icon: '≋' },
  { id: 'tsunami', label: 'Tsunami', icon: '≈' },
  { id: 'cyclone', label: 'Cyclone', icon: '◌' },
  { id: 'heatwave', label: 'Heatwave', icon: '☀' },
  { id: 'lightning', label: 'Lightning', icon: 'ϟ' },
  { id: 'earthquake', label: 'Earthquake', icon: '⌁' },
  { id: 'landslide', label: 'Landslide', icon: '△' },
  { id: 'drought', label: 'Drought', icon: '◒' },
  { id: 'wildfire', label: 'Forest Fire', icon: '♨' },
  { id: 'severe-storm', label: 'Severe Storm', icon: '☁' },
  { id: 'chemical-emergency', label: 'Chemical Hazard', icon: '⚗' },
];

const LEVELS = {
  HIGH: { label: 'High', bars: 9, color: '#ef4444', fill: '#b91c1c' },
  MODERATE: { label: 'Moderate', bars: 6, color: '#f59e0b', fill: '#c77b12' },
  LOW: { label: 'Lower', bars: 3, color: '#84cc16', fill: '#5f7f2a' },
  unavailable: { label: 'Data N/A', bars: 1, color: '#94a3b8', fill: '#64748b' },
};

const HAZARD_ICONS = {
  flood: '≋',
  tsunami: '≈',
  cyclone: '◌',
  heatwave: '☀',
  lightning: 'ϟ',
  earthquake: '⌁',
  landslide: '△',
  drought: '◒',
  wildfire: '♨',
  'severe-storm': '☁',
  'chemical-emergency': '⚗',
};

const SOURCE_METADATA = {
  sourceName: 'Bundled India administrative GeoJSON and prototype historical hazard profile data',
  lastVerified: '2026-08-09',
  disclaimer: 'Educational prototype data, not an official risk assessment.',
};

const REGION_BY_ID = new Map(REGION_PROFILES.map((region) => [region.id, region]));

/* City coordinates from the existing map data. */
const CITY_POINTS = {
  'andaman-and-nicobar-islands': [
    { name: 'Port Blair', coords: [11.62, 92.73] },
    { name: 'Diglipur', coords: [13.27, 93.01] },
    { name: 'Mayabunder', coords: [12.92, 92.90] },
    { name: 'Rangat', coords: [12.51, 92.98] },
  ],

  'andhra-pradesh': [
    { name: 'Visakhapatnam', coords: [17.69, 83.22] },
    { name: 'Vijayawada', coords: [16.51, 80.65] },
    { name: 'Guntur', coords: [16.31, 80.44] },
    { name: 'Tirupati', coords: [13.63, 79.42] },
    { name: 'Nellore', coords: [14.44, 79.99] },
    { name: 'Kurnool', coords: [15.83, 78.04] },
    { name: 'Rajahmundry', coords: [17.00, 81.78] },
    { name: 'Kadapa', coords: [14.47, 78.82] },
  ],

  'arunachal-pradesh': [
    { name: 'Itanagar', coords: [27.08, 93.61] },
    { name: 'Naharlagun', coords: [27.10, 93.69] },
    { name: 'Tawang', coords: [27.59, 91.86] },
    { name: 'Pasighat', coords: [28.07, 95.33] },
  ],

  assam: [
    { name: 'Guwahati', coords: [26.14, 91.74] },
    { name: 'Dibrugarh', coords: [27.47, 94.91] },
    { name: 'Silchar', coords: [24.82, 92.80] },
    { name: 'Jorhat', coords: [26.75, 94.20] },
    { name: 'Tezpur', coords: [26.63, 92.80] },
    { name: 'Nagaon', coords: [26.35, 92.68] },
  ],

  bihar: [
    { name: 'Patna', coords: [25.59, 85.13] },
    { name: 'Gaya', coords: [24.79, 85.00] },
    { name: 'Muzaffarpur', coords: [26.12, 85.39] },
    { name: 'Bhagalpur', coords: [25.25, 87.00] },
    { name: 'Darbhanga', coords: [26.15, 85.90] },
  ],

  chandigarh: [
    { name: 'Chandigarh', coords: [30.73, 76.78] },
  ],

  chhattisgarh: [
    { name: 'Raipur', coords: [21.25, 81.63] },
    { name: 'Bhilai', coords: [21.21, 81.38] },
    { name: 'Bilaspur', coords: [22.08, 82.15] },
    { name: 'Korba', coords: [22.35, 82.68] },
    { name: 'Jagdalpur', coords: [19.08, 82.03] },
  ],

  'dadra-and-nagar-haveli-and-daman-and-diu': [
    { name: 'Daman', coords: [20.40, 72.83] },
    { name: 'Silvassa', coords: [20.27, 73.01] },
    { name: 'Diu', coords: [20.71, 70.99] },
  ],

  delhi: [
    { name: 'New Delhi', coords: [28.61, 77.21] },
    { name: 'Delhi', coords: [28.67, 77.22] },
  ],

  goa: [
    { name: 'Panaji', coords: [15.49, 73.83] },
    { name: 'Vasco da Gama', coords: [15.39, 73.82] },
    { name: 'Margao', coords: [15.28, 73.96] },
    { name: 'Mapusa', coords: [15.59, 73.81] },
  ],

  gujarat: [
    { name: 'Ahmedabad', coords: [23.02, 72.57] },
    { name: 'Surat', coords: [21.17, 72.83] },
    { name: 'Vadodara', coords: [22.31, 73.18] },
    { name: 'Rajkot', coords: [22.30, 70.80] },
    { name: 'Bhavnagar', coords: [21.76, 72.15] },
    { name: 'Jamnagar', coords: [22.47, 70.07] },
    { name: 'Gandhinagar', coords: [23.22, 72.65] },
  ],

  haryana: [
    { name: 'Gurugram', coords: [28.46, 77.03] },
    { name: 'Faridabad', coords: [28.41, 77.31] },
    { name: 'Panipat', coords: [29.39, 76.96] },
    { name: 'Hisar', coords: [29.15, 75.72] },
    { name: 'Rohtak', coords: [28.90, 76.58] },
    { name: 'Ambala', coords: [30.38, 76.78] },
    { name: 'Karnal', coords: [29.69, 76.99] },
  ],

  'himachal-pradesh': [
    { name: 'Shimla', coords: [31.10, 77.17] },
    { name: 'Dharamshala', coords: [32.22, 76.32] },
    { name: 'Mandi', coords: [31.71, 76.93] },
    { name: 'Solan', coords: [30.90, 77.10] },
    { name: 'Kullu', coords: [31.96, 77.11] },
  ],

  'jammu-and-kashmir': [
    { name: 'Srinagar', coords: [34.08, 74.80] },
    { name: 'Jammu', coords: [32.73, 74.86] },
    { name: 'Anantnag', coords: [33.73, 75.15] },
    { name: 'Baramulla', coords: [34.20, 74.35] },
    { name: 'Kathua', coords: [32.38, 75.52] },
  ],

  jharkhand: [
    { name: 'Ranchi', coords: [23.34, 85.31] },
    { name: 'Jamshedpur', coords: [22.80, 86.20] },
    { name: 'Dhanbad', coords: [23.80, 86.44] },
    { name: 'Bokaro', coords: [23.67, 86.15] },
    { name: 'Deoghar', coords: [24.48, 86.70] },
  ],

  karnataka: [
    { name: 'Bengaluru', coords: [12.97, 77.59] },
    { name: 'Mangaluru', coords: [12.91, 74.85] },
    { name: 'Mysuru', coords: [12.30, 76.65] },
    { name: 'Hubballi', coords: [15.36, 75.12] },
    { name: 'Belagavi', coords: [15.85, 74.50] },
    { name: 'Kalaburagi', coords: [17.33, 76.84] },
    { name: 'Shivamogga', coords: [13.93, 75.57] },
    { name: 'Ballari', coords: [15.14, 76.92] },
  ],

  kerala: [
    { name: 'Kochi', coords: [9.93, 76.27] },
    { name: 'Thiruvananthapuram', coords: [8.52, 76.94] },
    { name: 'Kozhikode', coords: [11.25, 75.78] },
    { name: 'Thrissur', coords: [10.52, 76.21] },
    { name: 'Kollam', coords: [8.89, 76.59] },
    { name: 'Kannur', coords: [11.87, 75.37] },
    { name: 'Alappuzha', coords: [9.50, 76.33] },
  ],

  ladakh: [
    { name: 'Leh', coords: [34.15, 77.58] },
    { name: 'Kargil', coords: [34.56, 76.13] },
  ],

  lakshadweep: [
    { name: 'Kavaratti', coords: [10.56, 72.64] },
    { name: 'Agatti', coords: [10.85, 72.19] },
    { name: 'Minicoy', coords: [8.29, 73.05] },
  ],

  'madhya-pradesh': [
    { name: 'Bhopal', coords: [23.26, 77.41] },
    { name: 'Indore', coords: [22.72, 75.86] },
    { name: 'Jabalpur', coords: [23.18, 79.95] },
    { name: 'Gwalior', coords: [26.22, 78.18] },
    { name: 'Ujjain', coords: [23.18, 75.78] },
    { name: 'Sagar', coords: [23.84, 78.74] },
  ],

  maharashtra: [
    { name: 'Mumbai', coords: [19.08, 72.88] },
    { name: 'Pune', coords: [18.52, 73.86] },
    { name: 'Nagpur', coords: [21.15, 79.09] },
    { name: 'Nashik', coords: [20.00, 73.79] },
    { name: 'Aurangabad', coords: [19.88, 75.34] },
    { name: 'Kolhapur', coords: [16.70, 74.24] },
    { name: 'Solapur', coords: [17.66, 75.91] },
    { name: 'Amravati', coords: [20.94, 77.76] },
  ],

  manipur: [
    { name: 'Imphal', coords: [24.82, 93.94] },
    { name: 'Thoubal', coords: [24.64, 94.01] },
    { name: 'Churachandpur', coords: [24.33, 93.67] },
  ],

  meghalaya: [
    { name: 'Shillong', coords: [25.58, 91.89] },
    { name: 'Tura', coords: [25.51, 90.20] },
    { name: 'Jowai', coords: [25.45, 92.20] },
  ],

  mizoram: [
    { name: 'Aizawl', coords: [23.73, 92.72] },
    { name: 'Lunglei', coords: [22.89, 92.75] },
    { name: 'Champhai', coords: [23.47, 93.32] },
  ],

  nagaland: [
    { name: 'Kohima', coords: [25.67, 94.11] },
    { name: 'Dimapur', coords: [25.91, 93.73] },
    { name: 'Mokokchung', coords: [26.32, 94.52] },
    { name: 'Tuensang', coords: [26.27, 94.82] },
  ],

  odisha: [
    { name: 'Bhubaneswar', coords: [20.30, 85.82] },
    { name: 'Puri', coords: [19.81, 85.83] },
    { name: 'Cuttack', coords: [20.46, 85.88] },
    { name: 'Rourkela', coords: [22.26, 84.85] },
    { name: 'Berhampur', coords: [19.32, 84.79] },
    { name: 'Balasore', coords: [21.49, 86.93] },
    { name: 'Sambalpur', coords: [21.47, 83.97] },
    { name: 'Dhenkanal', coords: [20.66, 85.60] },
  ],

  puducherry: [
    { name: 'Puducherry', coords: [11.94, 79.81] },
    { name: 'Karaikal', coords: [10.93, 79.84] },
    { name: 'Mahe', coords: [11.70, 75.53] },
    { name: 'Yanam', coords: [16.73, 82.22] },
  ],

  punjab: [
    { name: 'Ludhiana', coords: [30.90, 75.86] },
    { name: 'Amritsar', coords: [31.63, 74.87] },
    { name: 'Jalandhar', coords: [31.33, 75.58] },
    { name: 'Patiala', coords: [30.34, 76.39] },
    { name: 'Bathinda', coords: [30.21, 74.95] },
    { name: 'Pathankot', coords: [32.27, 75.65] },
  ],

  rajasthan: [
    { name: 'Jaipur', coords: [26.91, 75.79] },
    { name: 'Jodhpur', coords: [26.24, 73.02] },
    { name: 'Udaipur', coords: [24.58, 73.68] },
    { name: 'Kota', coords: [25.18, 75.84] },
    { name: 'Ajmer', coords: [26.45, 74.64] },
    { name: 'Bikaner', coords: [28.02, 73.31] },
    { name: 'Alwar', coords: [27.55, 76.63] },
  ],

  sikkim: [
    { name: 'Gangtok', coords: [27.33, 88.61] },
    { name: 'Namchi', coords: [27.17, 88.36] },
    { name: 'Gyalshing', coords: [27.29, 88.26] },
  ],

  'tamil-nadu': [
    { name: 'Chennai', coords: [13.08, 80.27] },
    { name: 'Coimbatore', coords: [11.02, 76.96] },
    { name: 'Madurai', coords: [9.93, 78.12] },
    { name: 'Tiruchirappalli', coords: [10.79, 78.70] },
    { name: 'Salem', coords: [11.66, 78.16] },
    { name: 'Tirunelveli', coords: [8.73, 77.70] },
    { name: 'Thanjavur', coords: [10.79, 79.14] },
    { name: 'Nagapattinam', coords: [10.77, 79.84] },
    { name: 'Thoothukudi', coords: [8.81, 78.14] },
    { name: 'Vellore', coords: [12.92, 79.13] },
  ],

  telangana: [
    { name: 'Hyderabad', coords: [17.39, 78.49] },
    { name: 'Warangal', coords: [17.97, 79.59] },
    { name: 'Nizamabad', coords: [18.67, 78.09] },
    { name: 'Karimnagar', coords: [18.44, 79.13] },
    { name: 'Khammam', coords: [17.25, 80.15] },
  ],

  tripura: [
    { name: 'Agartala', coords: [23.83, 91.28] },
    { name: 'Dharmanagar', coords: [24.38, 92.17] },
    { name: 'Udaipur', coords: [23.53, 91.48] },
  ],

  'uttar-pradesh': [
    { name: 'Lucknow', coords: [26.85, 80.95] },
    { name: 'Varanasi', coords: [25.32, 82.97] },
    { name: 'Kanpur', coords: [26.45, 80.35] },
    { name: 'Agra', coords: [27.18, 78.02] },
    { name: 'Prayagraj', coords: [25.44, 81.84] },
    { name: 'Meerut', coords: [28.98, 77.71] },
    { name: 'Gorakhpur', coords: [26.76, 83.37] },
    { name: 'Noida', coords: [28.58, 77.33] },
  ],

  uttarakhand: [
    { name: 'Dehradun', coords: [30.32, 78.03] },
    { name: 'Haridwar', coords: [29.95, 78.16] },
    { name: 'Rishikesh', coords: [30.09, 78.27] },
    { name: 'Haldwani', coords: [29.22, 79.52] },
    { name: 'Nainital', coords: [29.39, 79.45] },
  ],

  'west-bengal': [
    { name: 'Kolkata', coords: [22.57, 88.36] },
    { name: 'Digha', coords: [21.63, 87.51] },
    { name: 'Siliguri', coords: [26.73, 88.40] },
    { name: 'Asansol', coords: [23.67, 87.68] },
    { name: 'Durgapur', coords: [23.52, 87.31] },
    { name: 'Howrah', coords: [22.59, 88.26] },
    { name: 'Haldia', coords: [22.06, 88.06] },
    { name: 'Kharagpur', coords: [22.35, 87.23] },
  ],
};


function getHazardProfile(id) {
  return DISASTER_PROFILES[id];
}

function getRegionHazard(region, hazardId) {
  return region?.hazards?.find((hazard) => hazard.hazardId === hazardId) || null;
}

function getAllowedHazards(region) {
  const allowedIds = new Set(HAZARDS.filter((hazard) => hazard.id !== 'all').map((hazard) => hazard.id));
  return (region?.hazards || []).filter((hazard) => allowedIds.has(hazard.hazardId));
}

function getPrimaryAllowedHazard(region) {
  return [...getAllowedHazards(region)].sort((a, b) => getRiskScore(b) - getRiskScore(a))[0] || null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

let selectedHazardRefForTooltip = 'all';

function getCityTooltipHtml(city, region) {
  const selectedId = selectedHazardRefForTooltip;
  const hazard =
    selectedId && selectedId !== 'all'
      ? getRegionHazard(region, selectedId) || getPrimaryAllowedHazard(region)
      : getPrimaryAllowedHazard(region);

  if (!hazard) {
    return `<div class="city-hover-card"><strong>${escapeHtml(city.name)}</strong><span>No historical hazard profile available.</span></div>`;
  }

  const style = getLevelStyle(hazard.educationalLevel);
  const chance = getHistoricalChance(hazard);
  const level = chance !== null ? `${chance}% historical likelihood` : style.label;

  return `
    <div class="city-hover-card">
      <strong>${escapeHtml(city.name)}</strong>
      <span>${HAZARD_ICONS[hazard.hazardId] || '•'} ${escapeHtml(getHazardProfile(hazard.hazardId)?.name || hazard.hazardId)} · <b style="color:${style.color}">${escapeHtml(level)}</b></span>
      <p>${escapeHtml(hazard.description || 'Historical hazard pattern recorded for this region.')}</p>
    </div>
  `;
}

function getLevelStyle(level) {
  return LEVELS[level] || LEVELS.unavailable;
}

function getHistoricalChance(hazard) {
  const fields = ['historicalChance', 'historicalProbability', 'probability', 'chance', 'likelihood'];
  for (const field of fields) {
    const value = Number(hazard?.[field]);
    if (Number.isFinite(value)) {
      const percentage = value <= 1 ? value * 100 : value;
      return Math.max(0, Math.min(100, Math.round(percentage)));
    }
  }
  return null;
}

function getRiskScore(hazard) {
  const chance = getHistoricalChance(hazard);
  if (chance !== null) return chance;
  return ({ HIGH: 90, MODERATE: 60, LOW: 30 }[hazard?.educationalLevel] || 10);
}

function getRiskText(hazard) {
  const chance = getHistoricalChance(hazard);
  if (chance !== null) return `${chance}% historical likelihood`;
  return `${getLevelStyle(hazard?.educationalLevel).label} historical likelihood`;
}

function formatWeather(value, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return `${Math.round(value)}${suffix}`;
}

function searchPlaces(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const regions = REGION_PROFILES.filter((region) =>
    region.name.toLowerCase().includes(q) ||
    region.id.replaceAll('-', ' ').includes(q) ||
    region.type.toLowerCase().includes(q)
  ).map((region) => ({ type: 'region', region }));

  const cities = REGION_PROFILES.flatMap((region) =>
    (CITY_POINTS[region.id] || [])
      .filter((city) => city.name.toLowerCase().includes(q))
      .map((city) => ({ type: 'city', region, city }))
  );

  return [...regions, ...cities].slice(0, 8);
}

function RiskBar({ hazard }) {
  const style = getLevelStyle(hazard.educationalLevel);
  const chance = getHistoricalChance(hazard);
  const score = chance !== null ? chance : getRiskScore(hazard);
  const filled = Math.max(1, Math.min(10, Math.round(score / 10)));

  return (
    <div className="risk-row">
      <div className="risk-row-top">
        <div className="risk-name">
          <span className="risk-icon">{HAZARD_ICONS[hazard.hazardId] || '!'}</span>
          <span>{getHazardProfile(hazard.hazardId)?.name || hazard.hazardId}</span>
        </div>
        <span className="risk-level" style={{ color: style.color }}>
          {chance !== null ? `${chance}%` : style.label}
        </span>
      </div>

      <div className="risk-track" aria-label={getRiskText(hazard)}>
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={`${hazard.hazardId}-${index}`}
            className={index < filled ? 'filled' : ''}
            style={{ '--risk-color': style.color }}
          />
        ))}
      </div>

      <div className="risk-row-bottom">
        <span>{getRiskText(hazard)}</span>
      </div>
    </div>
  );
}

function WeatherCard({ region, city, weather }) {
  const current = weather.data?.current;

  if (!city) {
    return (
      <section className="map-card weather-card weather-empty">
        <div className="section-kicker">Weather now</div>
        <h3>Select a city</h3>
        <p>Click any city marker or city name to load its current weather.</p>
        <p className="weather-note">Weather is loaded from Open-Meteo using the selected city's coordinates.</p>
      </section>
    );
  }

  return (
    <section className="map-card weather-card">
      <div className="section-heading-line">
        <div>
          <div className="section-kicker">Weather now</div>
          <h3>{city.name}</h3>
          <p>{region.name}</p>
        </div>
        <div className="temperature">{current ? formatWeather(current.temperature_2m, '°C') : '--'}</div>
      </div>

      {weather.status === 'loading' && (
        <p className="weather-loading-text">Fetching live weather...</p>
      )}

      {weather.status === 'error' && (
        <p className="weather-error-text">Weather is temporarily unavailable. Please try selecting the city again.</p>
      )}

      <div className="weather-grid">
        <div><strong>{current ? formatWeather(current.relative_humidity_2m, '%') : '--'}</strong><span>Humidity</span></div>
        <div><strong>{current ? formatWeather(current.wind_speed_10m, ' km/h') : '--'}</strong><span>Wind</span></div>
        <div><strong>{current ? formatWeather(current.precipitation, ' mm') : '--'}</strong><span>Rainfall</span></div>
        <div><strong>{current ? formatWeather(current.apparent_temperature, '°C') : '--'}</strong><span>Feels like</span></div>
      </div>

      <p className="weather-note">Current conditions from Open-Meteo.</p>
    </section>
  );
}

function RegionPanel({ region, selectedCity, weather, selectedHazard, onClose, onSelectCity }) {
  const hazards = (selectedHazard === 'all'
    ? getAllowedHazards(region)
    : (getRegionHazard(region, selectedHazard) ? [getRegionHazard(region, selectedHazard)] : [])
  ).sort((a, b) => getRiskScore(b) - getRiskScore(a));
  const strongest = hazards[0];
  const cities = CITY_POINTS[region.id] || [];

  return (
    <aside className="region-panel">
      <div className="region-panel-header">
        <div>
          <div className="section-kicker">Selected region</div>
          <h2>{region.name}</h2>
          <p>{region.type} <span>•</span> {region.region}</p>
        </div>
        <button className="close-region" onClick={onClose} aria-label="Close selected region">×</button>
      </div>

      <div className="region-scroll">
        <section className="risk-summary map-card">
          <div className="section-heading-line">
            <div>
              <div className="section-kicker">Risk summary · historical data</div>
              <h3>{strongest ? `Most prone to ${getHazardProfile(strongest.hazardId)?.name || strongest.hazardId}` : selectedHazard !== 'all' ? `No ${getHazardProfile(selectedHazard)?.name || selectedHazard} data` : 'Historical risk profile'}</h3>
              <p>{selectedHazard === 'all'
                ? `How prone ${region.name} is to different hazards based on the past disaster-pattern data in this project.`
                : `Historical ${getHazardProfile(selectedHazard)?.name || selectedHazard} risk for ${region.name} based on the project data.`}</p>
            </div>
          </div>

          <div className="risk-list">
            {hazards.map((hazard) => (
              <RiskBar key={hazard.hazardId} hazard={hazard} />
            ))}
          </div>
        </section>

        <WeatherCard region={region} city={selectedCity} weather={weather} />

        {cities.length > 0 && (
          <section className="map-card cities-card">
            <div className="section-kicker">Cities · {cities.length}</div>
            <p>Move over a city to see its historical hazard profile. Click it to load live weather.</p>
            <div className="city-buttons">
              {cities.map((city) => (
                <button
                  key={city.name}
                  className={selectedCity?.name === city.name ? 'active' : ''}
                  onClick={() => onSelectCity(city)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="map-card about-card">
          <div className="section-kicker">About this data</div>
          <p>Risk levels are derived from the historical disaster-pattern records bundled with this prototype.</p>
          <div className="data-note">Last verified: {SOURCE_METADATA.lastVerified}</div>
        </section>
      </div>

      <div className="region-panel-footer">{SOURCE_METADATA.disclaimer}</div>
    </aside>
  );
}

export default function IndiaMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);
  const cityLayerRef = useRef(null);
  const layersRef = useRef(new Map());
  const selectedRegionRef = useRef(null);
  const selectedHazardRef = useRef('all');

  const [selectedHazard, setSelectedHazard] = useState('all');
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadState, setLoadState] = useState('loading');
  const [weather, setWeather] = useState({ status: 'idle', data: null });

  const selectedRegion = selectedRegionId ? REGION_BY_ID.get(selectedRegionId) : null;
  const searchResults = useMemo(() => searchPlaces(searchQuery), [searchQuery]);

  const getRegionStyle = useCallback((regionId, hoverId = null) => {
    const region = REGION_BY_ID.get(regionId);
    if (!region) return {};

    const hazard = selectedHazardRef.current === 'all'
      ? getPrimaryAllowedHazard(region)
      : getRegionHazard(region, selectedHazardRef.current);

    const style = getLevelStyle(hazard?.educationalLevel);
    const isHovered = hoverId === regionId;
    const isSelected = selectedRegionRef.current === regionId;
    const isFilteredOut = selectedHazardRef.current !== 'all' && !hazard;

    return {
      color: isHovered
        ? '#ffffff'
        : isSelected
          ? '#dbeafe'
          : 'rgba(255,255,255,0.62)',
      weight: isHovered ? 2.2 : isSelected ? 1.35 : 0.8,
      opacity: isFilteredOut ? 0.25 : 0.92,
      fillColor: style.fill,
      fillOpacity: isFilteredOut
        ? 0.10
        : isHovered
          ? 0.82
          : isSelected
            ? 0.74
            : 0.62,
    };
  }, []);

  const restyleAll = useCallback((hoverId = null) => {
    layersRef.current.forEach((layer, regionId) => {
      layer.setStyle(getRegionStyle(regionId, hoverId));
    });
  }, [getRegionStyle]);

  const selectRegion = useCallback((regionId, fly = false) => {
    const region = REGION_BY_ID.get(regionId);
    if (!region) return;

    setSelectedRegionId(regionId);
    selectedRegionRef.current = regionId;

    // Selecting a state does NOT automatically select a city.
    // A city becomes selected only when its marker/button is clicked.
    setSelectedCity(null);

    window.history.replaceState(null, '', `/india-map?region=${regionId}`);

    if (fly && mapRef.current) {
      const layer = layersRef.current.get(regionId);
      if (layer?.getBounds) {
        mapRef.current.flyToBounds(layer.getBounds().pad(0.25), { duration: 0.7, maxZoom: 6.5 });
      }
    }
  }, []);

  const selectCity = useCallback((city, regionId = selectedRegionId) => {
    if (!regionId) return;
    selectRegion(regionId, false);
    setSelectedCity({ ...city, regionId });
    mapRef.current?.flyTo(city.coords, 7.2, { duration: 0.7 });
  }, [selectRegion, selectedRegionId]);

  useEffect(() => {
    selectedHazardRef.current = selectedHazard;
    selectedHazardRefForTooltip = selectedHazard;
    restyleAll(hoveredRegionId);
  }, [selectedHazard, hoveredRegionId, restyleAll]);

  useEffect(() => {
    if (!selectedRegion) return;
    const point = selectedCity?.regionId === selectedRegion.id
      ? selectedCity
      : null;

    if (!point) {
      setWeather({ status: 'idle', data: null });
      return;
    }

    const [latitude, longitude] = point.coords;
    const controller = new AbortController();
    setWeather({ status: 'loading', data: null });

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Weather request failed');
        return response.json();
      })
      .then((data) => setWeather({ status: 'ready', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setWeather({ status: 'error', data: null });
      });

    return () => controller.abort();
  }, [selectedRegion, selectedCity]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: 5.0,
      minZoom: 4,
      maxZoom: 8,
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true,
      attributionControl: true,
    });

    mapRef.current = map;

    map.createPane('cityPane');
    map.getPane('cityPane').style.zIndex = '650';

    const imagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    );

    const labels = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels &copy; Esri',
        maxZoom: 19,
        pane: 'overlayPane',
        opacity: 0.78,
      }
    );

    imagery.addTo(map);
    labels.addTo(map);

    let cancelled = false;

    fetch('/data/india-states.geojson')
      .then((response) => {
        if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        const geoLayer = L.geoJSON(data, {
          style: (feature) => getRegionStyle(feature?.properties?.id || ''),
          onEachFeature: (feature, layer) => {
            const regionId = feature?.properties?.id || '';
            const region = REGION_BY_ID.get(regionId);
            if (!region) return;

            layersRef.current.set(regionId, layer);

            const primary = getPrimaryAllowedHazard(region);
            const primaryName = primary
              ? getHazardProfile(primary.hazardId)?.name || primary.hazardId
              : 'No hazard data';

            layer.bindTooltip(
              `<div class="state-hover-card"><strong>${escapeHtml(region.name)}</strong><span>${escapeHtml(primaryName)} · ${escapeHtml(primary ? getLevelStyle(primary.educationalLevel).label : 'Data N/A')}</span><p>${escapeHtml(primary?.description || 'Historical hazard profile available in the selected region panel.')}</p></div>`,
              { sticky: true, direction: 'top', className: 'state-tooltip', opacity: 1 }
            );

            layer.bindTooltip(region.name, {
              permanent: true,
              direction: 'center',
              className: 'state-label',
              opacity: 0.82,
            });

            layer.on({
              mouseover: () => {
                setHoveredRegionId(regionId);
                layer.setStyle(getRegionStyle(regionId, regionId));
                layer.bringToFront();
              },
              mouseout: () => {
                setHoveredRegionId(null);
                layer.setStyle(getRegionStyle(regionId));
              },
              click: () => selectRegion(regionId, false),
            });
          },
        }).addTo(map);

        geoJsonRef.current = geoLayer;
        map.fitBounds(geoLayer.getBounds().pad(0.02), { maxZoom: 5.35 });
        setLoadState('ready');

        const urlRegion = new URLSearchParams(window.location.search).get('region');
        if (urlRegion && REGION_BY_ID.has(urlRegion)) {
          selectRegion(urlRegion, false);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoadState('error');
      });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
      geoJsonRef.current = null;
      cityLayerRef.current = null;
      layersRef.current.clear();
    };
  }, [getRegionStyle, selectRegion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (cityLayerRef.current) {
      cityLayerRef.current.remove();
      cityLayerRef.current = null;
    }

    // Keep the map clean: only show city markers for the selected state.
    if (!selectedRegionId) return;

    const cities = CITY_POINTS[selectedRegionId] || [];
    if (!cities.length) return;

    const group = L.layerGroup();

    cities.forEach((city) => {
      const selected =
        selectedCity?.regionId === selectedRegionId &&
        selectedCity?.name === city.name;

      const marker = L.circleMarker(city.coords, {
        pane: 'cityPane',
        radius: selected ? 7 : 3.5,
        color: selected ? '#e0f2fe' : '#fbbf24',
        weight: selected ? 2.5 : 1.25,
        fillColor: selected ? '#38bdf8' : '#f59e0b',
        fillOpacity: selected ? 1 : 0.78,
        className: selected
          ? 'india-city-marker selected-city-marker'
          : 'india-city-marker',
      });

      marker.bindTooltip(
        getCityTooltipHtml(city, REGION_BY_ID.get(selectedRegionId)),
        {
          direction: 'top',
          className: 'city-tooltip',
          offset: [0, -8],
          sticky: true,
          opacity: 1,
        }
      );

      marker.on('mouseover', () => {
        marker.setStyle({
          radius: selected ? 8 : 5.5,
          weight: 2,
        });
      });

      marker.on('mouseout', () => {
        marker.setStyle({
          radius: selected ? 7 : 3.5,
          weight: selected ? 2.5 : 1.5,
        });
      });

      marker.on('click', () => selectCity(city, selectedRegionId));
      marker.addTo(group);
    });

    group.addTo(map);
    cityLayerRef.current = group;
  }, [selectedRegionId, selectedCity, selectCity]);

  const handleReset = () => {
    if (geoJsonRef.current && mapRef.current) {
      mapRef.current.flyToBounds(geoJsonRef.current.getBounds().pad(0.02), { duration: 0.7, maxZoom: 5.35 });
    }
    setSelectedRegionId(null);
    setSelectedCity(null);
    selectedRegionRef.current = null;
    selectedHazardRef.current = 'all';
    setSelectedHazard('all');
    window.history.replaceState(null, '', '/india-map');
  };

  const submitSearch = (result) => {
    if (!result) return;
    if (result.type === 'city') {
      selectCity(result.city, result.region.id);
      setSearchQuery(result.city.name);
    } else {
      selectRegion(result.region.id, false);
      setSearchQuery(result.region.name);
    }
  };

  return (
    <div className="india-map-page">
      <header className="india-map-header">
        <div className="map-brand">
          <div className="brand-mark">◈</div>
          <div>
            <div className="brand-title">INDIA DISASTER MAP</div>
            <div className="brand-subtitle">Historical disaster risk insights &amp; regional patterns</div>
          </div>
        </div>

        <div className="map-search-panel">
          <div className="search-wrapper">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitSearch(searchResults[0]);
              }}
              placeholder="Search state, UT or city..."
              aria-label="Search state, Union Territory or city"
            />
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.type === 'city' ? result.city.name : result.region.id}`}
                    onClick={() => submitSearch(result)}
                  >
                    <strong>{result.type === 'city' ? result.city.name : result.region.name}</strong>
                    <small>{result.type === 'city' ? result.region.name : result.region.type}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="search-button" onClick={() => submitSearch(searchResults[0])}>Search</button>
        </div>
      </header>

      <div className="hazard-filter-bar">
        <label htmlFor="hazard-filter">Hazard filter</label>
        <div className="hazard-select-wrap">
          <span className="hazard-select-icon">{HAZARDS.find((hazard) => hazard.id === selectedHazard)?.icon || '◈'}</span>
          <select
            id="hazard-filter"
            value={selectedHazard}
            onChange={(event) => setSelectedHazard(event.target.value)}
            aria-label="Filter map by hazard"
          >
            {HAZARDS.map((hazard) => (
              <option key={hazard.id} value={hazard.id}>
                {hazard.label}
              </option>
            ))}
          </select>
        </div>
        <span className="hazard-filter-hint">Filter historical risk shown on the map</span>
      </div>

      <main className="india-map-layout">
        <section className="map-shell">
          <div className="map-stage">
            <div ref={mapContainerRef} className="disaster-intel-map" aria-label="Interactive India disaster map" />

            {loadState === 'loading' && (
              <div className="map-loading"><span className="loading-spinner" /> Loading India map...</div>
            )}

            {loadState === 'error' && (
              <div className="map-loading error">Map data could not be loaded. Check /public/data/india-states.geojson.</div>
            )}
<div className="map-legend">
              <div className="legend-title">Risk Level · Historical Data</div>
              {Object.entries(LEVELS).map(([key, value]) => (
                <div className="legend-item" key={key}>
                  <i style={{ background: value.fill }} />
                  <span>{value.label}</span>
                </div>
              ))}
            </div>

            <div className="map-controls">
              <button onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in">+</button>
              <button onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out">−</button>
              <button onClick={handleReset} aria-label="Reset India view">⌂</button>
            </div>

            <div className="map-bottom-note">
              <span>Colors indicate relative hazard exposure based on past disaster-pattern data.</span>
              <strong>{selectedRegion ? `Selected: ${selectedRegion.name}` : 'Click a state or city for detailed risk insights.'}</strong>
            </div>
          </div>

          <footer className="map-footer">
            <span>Map tiles: OpenStreetMap / CARTO.</span>
            <span>Data: bundled GeoJSON + prototype historical data.</span>
          </footer>
        </section>

        <div className="region-column">
          {selectedRegion ? (
            <RegionPanel
              region={selectedRegion}
              selectedCity={selectedCity}
              weather={weather}
              selectedHazard={selectedHazard}
              onClose={handleReset}
              onSelectCity={(city) => selectCity(city, selectedRegion.id)}
            />
          ) : (
            <section className="region-panel empty-region-panel">
              <div className="empty-icon">◈</div>
              <div className="section-kicker">Explore India</div>
              <h2>Historical disaster risk map</h2>
              <p>Click any state or city to see which hazards the region has historically been most prone to.</p>
              <div className="empty-points">
                <span>✓ State boundaries are clickable</span>
                <span>✓ City markers are clickable</span>
                <span>✓ Drag the map to pan</span>
                <span>✓ Compare hazards from past data</span>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}