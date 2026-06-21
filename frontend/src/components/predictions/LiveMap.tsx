import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons if needed
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    case 'high': return '#fb923c'; // text-orange-400
    case 'moderate': return '#fbbf24'; // text-amber-400
    default: return '#34d399'; // text-emerald-400
  }
}

export default function LiveMap({ hotspots }: { hotspots: any[] }) {
  // Center map on India to see all scattered locations
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={5} 
      style={{ height: '100%', width: '100%', background: '#0f172a', zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {hotspots.map((spot, i) => {
        const coords = REAL_COORDS[spot.area] || [
          defaultCenter[0] + (Math.random() - 0.5) * 0.1, 
          defaultCenter[1] + (Math.random() - 0.5) * 0.1
        ];
        return (
          <CircleMarker
            key={i}
            center={coords as [number, number]}
            radius={spot.risk_level?.toLowerCase() === 'critical' ? 24 : 12}
            pathOptions={{
              color: getRiskColor(spot.risk_level),
              fillColor: getRiskColor(spot.risk_level),
              fillOpacity: 0.4,
              weight: 2
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-center font-sans">
                <strong>{spot.area}</strong><br/>
                Risk: {spot.risk_level}<br/>
                Incidents: {spot.avg_predicted_incidents?.toFixed(1)}/wk
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
