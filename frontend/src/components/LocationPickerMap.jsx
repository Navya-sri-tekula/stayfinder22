import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const DEFAULT_CENTER = [17.385, 78.4867];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click(event) { onLocationSelect(event.latlng.lat, event.latlng.lng, null); } });
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && Number.isFinite(position.lat) && Number.isFinite(position.lng)) {
      map.flyTo([position.lat, position.lng], 17, { duration: 0.7 });
    }
  }, [position?.lat, position?.lng, map]);
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange, height = '320px' }) {
  const parsedLat = latitude !== '' && latitude !== null && latitude !== undefined ? Number(latitude) : NaN;
  const parsedLng = longitude !== '' && longitude !== null && longitude !== undefined ? Number(longitude) : NaN;
  const hasInitial = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  const [position, setPosition] = useState(hasInitial ? { lat: parsedLat, lng: parsedLng, accuracy: null } : null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    if (hasInitial) setPosition((old) => old && old.lat === parsedLat && old.lng === parsedLng ? old : { lat: parsedLat, lng: parsedLng, accuracy: old?.accuracy ?? null });
  }, [hasInitial, parsedLat, parsedLng]);

  const handleSelect = (lat, lng, accuracy = null) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const next = { lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)), accuracy };
    setPosition(next);
    setGpsError('');
    onLocationChange(next.lat, next.lng, accuracy);
  };

  const handleDetectLocation = () => {
    setGpsError('');
    if (!window.isSecureContext) {
      setGpsError('GPS requires a secure HTTPS connection.');
      return;
    }
    if (!navigator.geolocation) {
      setGpsError('Your browser does not support GPS location.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handleSelect(coords.latitude, coords.longitude, coords.accuracy);
        setGpsLoading(false);
      },
      (error) => {
        const messages = {
          1: 'Location permission denied. Allow location access in your browser settings.',
          2: 'Your device could not find a GPS position. Check that device location is enabled.',
          3: 'GPS timed out. Try again outdoors or near a window.',
        };
        setGpsError(messages[error.code] || error.message || 'Could not detect your location.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const initialCenter = position ? [position.lat, position.lng] : DEFAULT_CENTER;

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border-color)' }}>
      <MapContainer center={initialCenter} zoom={position ? 17 : 12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <RecenterMap position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleSelect} />
        {position && <>
          <Marker position={[position.lat, position.lng]} icon={pickerIcon} draggable eventHandlers={{ dragend: (event) => {
            const point = event.target.getLatLng();
            handleSelect(point.lat, point.lng, null);
          } }} />
          {position.accuracy > 0 && <Circle center={[position.lat, position.lng]} radius={position.accuracy} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.12, weight: 1 }} />}
        </>}
      </MapContainer>
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'rgba(255,255,255,.96)', padding: '7px 10px', borderRadius: 8, fontSize: '.78rem', boxShadow: 'var(--shadow-md)', color: '#334155', maxWidth: '75%' }}>
        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
        {position ? 'Pin selected — drag it or click the map to refine' : 'Use GPS or click the exact property entrance on the map'}
      </div>
      <button type="button" onClick={handleDetectLocation} disabled={gpsLoading} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: '#fff', border: '1px solid #cbd5e1', padding: '8px 11px', borderRadius: 8, fontSize: '.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: gpsLoading ? 'wait' : 'pointer' }}>
        {gpsLoading ? <Loader2 size={14} className="spin" /> : <Navigation size={14} />} {gpsLoading ? 'Locating…' : 'Use My GPS'}
      </button>
      {gpsError && <div role="alert" style={{ position: 'absolute', top: 54, right: 12, zIndex: 1000, maxWidth: 280, background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', padding: 9, borderRadius: 8, fontSize: '.75rem' }}>{gpsError}</div>}
    </div>
  );
}
