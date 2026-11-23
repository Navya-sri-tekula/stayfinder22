import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { formatCurrency, getPriceSuffix, getImageUrl } from '../utils/helpers';

// Fix default leaflet icon paths
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to re-center map dynamically
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(Number(center[0])) && Number.isFinite(Number(center[1]))) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  properties = [],
  center = [17.385, 78.4867], // Hyderabad fallback
  zoom = 12,
  userCoords = null,
  radiusKm = null,
}) => {
  // If we have properties, compute center or use userCoords
  let mapCenter = center;
  if (userCoords && Number.isFinite(Number(userCoords.latitude)) && Number.isFinite(Number(userCoords.longitude))) {
    mapCenter = [userCoords.latitude, userCoords.longitude];
  } else if (properties.length > 0 && properties[0].latitude != null && properties[0].longitude != null) {
    mapCenter = [parseFloat(properties[0].latitude), parseFloat(properties[0].longitude)];
  }

  return (
    <div className="map-view-container" style={{ height: '100%', minHeight: '500px', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker if available */}
        {userCoords && Number.isFinite(Number(userCoords.latitude)) && Number.isFinite(Number(userCoords.longitude)) && (
          <>
            <Marker position={[userCoords.latitude, userCoords.longitude]} icon={userLocationIcon}>
              <Popup>
                <div style={{ fontWeight: 700, color: '#dc2626' }}>Your Current Location</div>
              </Popup>
            </Marker>

            {/* Radius Circle */}
            {radiusKm && (
              <Circle
                center={[userCoords.latitude, userCoords.longitude]}
                radius={radiusKm * 1000} // meters
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
            )}
          </>
        )}

        {/* Property markers */}
        {properties.map((property) => {
          const lat = parseFloat(property.latitude);
          const lng = parseFloat(property.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const image = property.images && property.images.length > 0
            ? getImageUrl(property.images[0].image_url)
            : getImageUrl(null);

          return (
            <Marker key={property.id} position={[lat, lng]} icon={customMarkerIcon}>
              <Popup>
                <div className="map-popup-card">
                  <img src={image} alt={property.name} className="map-popup-img" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className={`badge badge-${property.type}`} style={{ fontSize: '0.7rem' }}>
                      {property.type}
                    </span>
                    {property.average_rating > 0 && (
                      <span className="rating-pill" style={{ fontSize: '0.75rem', padding: '1px 5px' }}>
                        <Star size={11} fill="currentColor" /> {property.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <h4 className="map-popup-title">{property.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                    <MapPin size={12} /> {property.address}, {property.city}
                  </div>
                  <div className="map-popup-price">
                    {formatCurrency(property.starting_price)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                      {getPriceSuffix(property.type)}
                    </span>
                  </div>
                  <Link
                    to={`/properties/${property.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
