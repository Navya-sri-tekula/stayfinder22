import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map event listener component for clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPickerMap = ({
  latitude,
  longitude,
  onLocationChange,
  height = '320px',
}) => {
  const defaultLat = latitude ? parseFloat(latitude) : 12.9716;
  const defaultLng = longitude ? parseFloat(longitude) : 77.5946;

  const [position, setPosition] = useState(
    Number.isFinite(defaultLat) && Number.isFinite(defaultLng) && latitude !== '' && longitude !== ''
      ? { lat: defaultLat, lng: defaultLng }
      : null
  );

  const handleSelect = (lat, lng) => {
    const fixedLat = Math.round(lat * 1000000) / 1000000;
    const fixedLng = Math.round(lng * 1000000) / 1000000;
    setPosition({ lat: fixedLat, lng: fixedLng });
    onLocationChange(fixedLat, fixedLng);
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        handleSelect(pos.coords.latitude, pos.coords.longitude);
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border-color)' }}>
      <MapContainer
        center={position ? [position.lat, position.lng] : [17.385, 78.4867]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleSelect} />
        {position && <Marker
          position={[position.lat, position.lng]}
          icon={pickerIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              handleSelect(pos.lat, pos.lng);
            },
          }}
        />}
      </MapContainer>

      {/* Floating Instructions & GPS Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
        }}
      >
        <MapPin size={14} color="var(--primary)" />
        <span>Click map to place the property pin; drag it to adjust</span>
      </div>

      <button
        type="button"
        onClick={handleDetectLocation}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <Navigation size={14} color="var(--primary)" />
        <span>Use My GPS</span>
      </button>
    </div>
  );
};

export default LocationPickerMap;
