import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { Maximize2, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Fix for default marker icons if needed
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Deterministic pseudo-random number generator to prevent jitter
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Real coordinates for the locations from all datasets
const REAL_COORDS: Record<string, [number, number]> = {
  // Mumbai
  'Dharavi': [19.0380, 72.8538],
  'Andheri': [19.1136, 72.8697],
  'Kurla': [19.0726, 72.8845],
  'Worli': [19.0169, 72.8166],
  'Goregaon': [19.1646, 72.8493],
  'Borivali': [19.2307, 72.8567],
  'Bandra': [19.0596, 72.8295],
  'Dadar': [19.0178, 72.8478],
  // Bangalore
  'Whitefield': [12.9698, 77.7499],
  'Indiranagar': [12.9784, 77.6408],
  'KR Puram': [13.0012, 77.6835],
  'Koramangala': [12.9352, 77.6245],
  'Hebbal': [13.0354, 77.5988],
  'HSR Layout': [12.9121, 77.6446],
  'JP Nagar': [12.9063, 77.5857],
  // Hyderabad
  'Charminar': [17.3616, 78.4747],
  'Madhapur': [17.4483, 78.3915],
  'Secunderabad': [17.4399, 78.4983],
  'Banjara Hills': [17.4156, 78.4414],
  // Delhi
  'Saket': [28.5244, 77.2066],
  'Dwarka': [28.5823, 77.0500],
  'Anand Vihar': [28.6500, 77.3167],
  'Karol Bagh': [28.6510, 77.1900],
  'Rohini': [28.7366, 77.1130],
  'Connaught Place': [28.6315, 77.2167],
  'Lajpat Nagar': [28.5677, 77.2433],
  'Chandni Chowk': [28.6505, 77.2303],
  // Chennai
  'T Nagar': [13.0418, 80.2341],
  'Velachery': [12.9815, 80.2180],
  'Anna Nagar': [13.0844, 80.2179],
  'Adyar': [13.0012, 80.2565]
};

function getRiskColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'critical': return '#ef4444'; // text-red-500
    case 'high': return '#f97316'; // text-orange-500
    case 'moderate': 
    case 'medium': return '#eab308'; // text-yellow-500
    default: return '#22c55e'; // text-green-500
  }
}

function getForecastColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'critical': return '#F97316'; // Orange
    case 'high': return '#EC4899'; // Pink
    case 'moderate': 
    case 'medium': return '#D946EF'; // Fuchsia
    default: return '#4F46E5'; // Indigo
  }
}

function getRiskShadow(level: string) {
  const color = getRiskColor(level);
  return `0 0 30px 10px ${color}40, 0 0 60px 20px ${color}20`;
}

// React wrapper for leaflet.heat
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || points.length === 0) return;
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 30,
      maxZoom: 15,
      max: 0.3, // Lower threshold makes the colors pop much more intensely
      gradient: { 0.4: '#3b82f6', 0.6: '#06b6d4', 0.7: '#84cc16', 0.8: '#eab308', 1.0: '#ef4444' }
    }).addTo(map);
    
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);
  return null;
}

// Custom Icons
const createClusterIcon = (count: number, riskLevel: string) => {
  const color = getRiskColor(riskLevel);
  return L.divIcon({
    className: 'custom-cluster-icon',
    html: `<div style="
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        background: ${color}; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 0 15px 5px ${color}80, 0 0 30px 15px ${color}40, 0 0 45px 25px ${color}20;
      ">
        ${count}
      </div>
    </div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 40]
  });
};

const createForecastIcon = (area: string, riskScore: number, riskLevel: string) => {
  const color = getForecastColor(riskLevel);
  return L.divIcon({
    className: 'custom-forecast-icon',
    html: `<div style="
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 40px; height: 40px;
        background: ${color};
        border-radius: 50%;
        filter: blur(15px);
        box-shadow: 0 0 50px 30px ${color}90, 0 0 80px 50px ${color}50;
      "></div>
      <div style="
        position: relative;
        z-index: 10;
        text-align: center;
        color: white;
        background: rgba(5, 11, 20, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 4px 10px;
        border-radius: 8px;
        backdrop-filter: blur(4px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.5);
      ">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.9;">${area}</div>
        <div style="font-size: 14px; font-weight: 900;">${Math.round(riskScore * 100)}%</div>
      </div>
    </div>`,
    iconSize: [150, 150],
    iconAnchor: [75, 75]
  });
};

const createShieldIcon = () => L.divIcon({
  className: 'custom-shield-icon',
  html: `<div style="
    background: #0f172a;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    padding: 3px;
    box-shadow: 0 0 8px #3b82f680;
    color: #60a5fa;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function LiveMap({ 
  hotspots = [], 
  crimes = [], 
  patrols = [], 
  cctvs = [],
  showMaximize = false,
  hideOverlay = false,
  theme = 'live'
}: { 
  hotspots?: any[],
  crimes?: any[],
  patrols?: any[],
  cctvs?: any[],
  showMaximize?: boolean,
  hideOverlay?: boolean,
  theme?: 'live' | 'forecast'
}) {
  // UI State
  const [mapMode, setMapMode] = useState<'heatmap' | 'clusters' | 'forecast'>(theme === 'forecast' ? 'forecast' : 'clusters');
  const [showPatrols, setShowPatrols] = useState(true);
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(false);

  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const indiaBounds: L.LatLngBoundsExpression = [
    [6.753515, 68.162386],
    [35.508700, 97.395561]
  ];

  return (
    <div className="relative w-full h-full bg-[#050b14] overflow-hidden rounded-xl font-sans">
      
      {/* MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={5} 
          minZoom={5}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', background: '#050b14' }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Custom Styled TileLayer - using Carto Dark Matter but with CSS filters to make it deep blue */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            className="filter sepia hue-rotate-[190deg] saturate-[3] brightness-[0.8] contrast-[1.2]"
          />

          {/* Map Modes: Heatmap / Clusters / Incidents */}
          
          {/* 1A. Heatmap Layer */}
          {mapMode === 'heatmap' && crimes.length > 0 && (
            <HeatmapLayer points={crimes.map(c => [c.lat, c.long, c.risk_score || 0.5])} />
          )}

          {/* 1B. Clusters (Hotspots) */}
          {mapMode === 'clusters' && hotspots.map((spot, i) => {
            const coords = REAL_COORDS[spot.area] || [
              defaultCenter[0] + seededRandom(i * 10) * 0.1, 
              defaultCenter[1] + seededRandom(i * 20) * 0.1
            ];
            // Use ?? instead of || to prevent overriding 0 with random numbers
            const incidentCount = Math.round(spot.avg_predicted_incidents ?? (seededRandom(i) * 30 + 5));
            return (
              <Marker
                key={`hotspot-${i}`}
                position={coords as [number, number]}
                icon={createClusterIcon(incidentCount, spot.risk_level)}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1} className="bg-[#0f172a] border-border/20 text-white">
                  <div className="text-center">
                    <p className="font-bold text-sm uppercase tracking-wider">{spot.area}</p>
                    <p className="text-xs" style={{ color: getRiskColor(spot.risk_level) }}>
                      {spot.risk_level} Risk
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

          {/* 1C. Forecast (Design Theme) */}
          {mapMode === 'forecast' && hotspots.map((spot, i) => {
            const coords = REAL_COORDS[spot.area] || [
              defaultCenter[0] + seededRandom(i * 10) * 0.1, 
              defaultCenter[1] + seededRandom(i * 20) * 0.1
            ];
            return (
              <Marker
                key={`forecast-${i}`}
                position={coords as [number, number]}
                icon={createForecastIcon(spot.area, spot.risk_score, spot.risk_level)}
              />
            );
          })}

          {/* 2. Patrol Units & Police Stations */}
          {showPatrols && patrols.map((patrol, i) => {
            const coords = REAL_COORDS[patrol.area];
            if (!coords) return null;
            // Deterministic offset to prevent jitter
            const offsetLat = coords[0] + seededRandom(i * 100) * 0.05;
            const offsetLng = coords[1] + seededRandom(i * 200) * 0.05;
            return (
              <Marker
                key={`patrol-${i}`}
                position={[offsetLat, offsetLng]}
                icon={createShieldIcon()}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-center font-sans">
                    <p className="font-bold text-sm">{patrol.area} Unit</p>
                    <p className="text-xs text-muted-foreground">Officers: {patrol.officer_count}</p>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

          {/* Layer: Incidents (Secondary toggle from legend) */}
          {showIncidentsLayer && crimes.map((crime, i) => (
             <CircleMarker
                key={`crime-layer-${i}`}
                center={[crime.lat, crime.long]}
                radius={2.5}
                pathOptions={{ color: '#fca5a5', fillColor: '#ef4444', fillOpacity: 0.8, weight: 1 }}
             />
          ))}
        </MapContainer>
      </div>

      {/* OVERLAY UI - TOP BAR */}
      {!hideOverlay && (
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <h2 className="text-white font-bold tracking-widest text-sm drop-shadow-md">LIVE CRIME MAP</h2>
        </div>

        {/* Center Toggles */}
        <div className="flex items-center bg-[#0B1220]/80 backdrop-blur-md border border-[#1e3a8a]/50 rounded-lg p-1 pointer-events-auto shadow-lg shadow-[#000000]/50">
           <button 
             className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${mapMode === 'heatmap' ? 'bg-[#1e3a8a] text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
             onClick={() => setMapMode('heatmap')}
           >
             <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${mapMode === 'heatmap' ? 'border-[#60a5fa]' : 'border-current'}`}>
               {mapMode === 'heatmap' && <div className="w-1.5 h-1.5 bg-[#60a5fa] rounded-sm"></div>}
             </div>
             Heatmap
           </button>
           <button 
             className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${mapMode === 'clusters' ? 'bg-[#1e3a8a] text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
             onClick={() => setMapMode('clusters')}
           >
             <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${mapMode === 'clusters' ? 'border-[#60a5fa]' : 'border-current'}`}>
               {mapMode === 'clusters' && <div className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full"></div>}
             </div>
             Clusters
           </button>
           <button 
             className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${mapMode === 'forecast' ? 'bg-[#1e3a8a] text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
             onClick={() => setMapMode('forecast')}
           >
             <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${mapMode === 'forecast' ? 'border-[#60a5fa]' : 'border-current'}`}>
               {mapMode === 'forecast' && <div className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full"></div>}
             </div>
             Forecast
           </button>
        </div>

        {/* Right Controls */}
        {showMaximize && (
          <div className="flex items-center gap-3 pointer-events-auto">
            <Link href="/map" className="p-2 bg-[#0B1220]/80 backdrop-blur-md border border-[#1e3a8a]/50 rounded-lg text-slate-400 hover:text-white shadow-lg transition-colors inline-block">
              <Maximize2 className="w-4 h-4" />
            </Link>
          </div>
        )}
        {/* Right Controls removed */}
      </div>
      )}

      {/* STANDALONE MAXIMIZE BUTTON (WHEN OVERLAY IS HIDDEN) */}
      {hideOverlay && showMaximize && (
        <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
          <Link href="/map?mode=forecast" className="p-2 bg-[#0B1220]/80 backdrop-blur-md border border-[#1e3a8a]/50 rounded-lg text-slate-400 hover:text-white shadow-lg transition-colors flex items-center justify-center hover:bg-[#1e3a8a]/20">
            <Maximize2 className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* FORECAST LEGEND (BOTTOM CENTER) */}
      {mapMode === 'forecast' && (
        hideOverlay ? (
          // Compact pill for Prediction Dashboard widget
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 pointer-events-none bg-[#0B1220]/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-slate-800/60">
            <span className="text-[8px] text-slate-300 font-bold uppercase whitespace-nowrap">Low Risk</span>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#D946EF] to-[#F97316]"></div>
            <span className="text-[8px] text-slate-300 font-bold uppercase whitespace-nowrap">High Risk</span>
          </div>
        ) : (
          // Full-sized pill matching the w-52 Risk Level Index box for Full Screen Map
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex items-center justify-between pointer-events-none bg-[#0B1220]/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-slate-800/60 w-52">
            <span className="text-[10px] text-slate-300 font-bold tracking-wide">Low Risk</span>
            <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#D946EF] to-[#F97316]"></div>
            <span className="text-[10px] text-slate-300 font-bold tracking-wide">High Risk</span>
          </div>
        )
      )}



      {/* FLOATING LEGEND (BOTTOM RIGHT) */}
      {!hideOverlay && (
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-3 pointer-events-none">
        
        <div className="bg-[#0B1220]/85 backdrop-blur-md border border-[#1e3a8a]/40 rounded-xl p-4 w-44 shadow-2xl pointer-events-auto flex flex-col gap-3">
          {/* RISK LEVEL */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Risk Level</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div> Critical
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.6)]"></div> High
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.6)]"></div> Medium
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></div> Low
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-800"></div>

          {/* LAYERS */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Layers</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer group">
                <input type="checkbox" checked={showPatrols} onChange={(e) => setShowPatrols(e.target.checked)} className="accent-[#3b82f6] rounded bg-[#0f172a] border-[#1e3a8a] scale-90" />
                <span className="group-hover:text-white transition-colors">Patrol Vehicles</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer group">
                <input type="checkbox" checked={showIncidentsLayer} onChange={(e) => setShowIncidentsLayer(e.target.checked)} className="accent-[#3b82f6] rounded bg-[#0f172a] border-[#1e3a8a] scale-90" />
                <span className="group-hover:text-white transition-colors">Incidents</span>
              </label>
            </div>
          </div>
        </div>

        {/* Map Zoom Controls Custom Overlay */}
        <div className="flex flex-col gap-1 pointer-events-auto bg-[#0B1220]/80 backdrop-blur-md border border-[#1e3a8a]/40 rounded-lg overflow-hidden w-10 ml-auto mr-[-4rem]">
           {/* We disabled default zoomControl, if needed we can add custom zoom buttons here */}
        </div>
      </div>
      )}
    </div>
  );
}
