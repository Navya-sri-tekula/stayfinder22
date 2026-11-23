import { useCallback, useState } from 'react';

const explainGeolocationError = (error) => {
  if (!error) return 'Could not determine your location. Please try again.';
  if (error.code === 1) return 'Location permission was denied. Allow location access for this site in your browser settings, then try again.';
  if (error.code === 2) return 'Your device could not determine its location. Turn on device location/GPS and try again.';
  if (error.code === 3) return 'Location request timed out. Move near a window or try again with a stronger GPS signal.';
  return error.message || 'Could not determine your location.';
};

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getLocation = useCallback(() => {
    if (!window.isSecureContext) {
      setError('Location access requires HTTPS. Open StayFinder using its secure https:// address.');
      return;
    }
    if (!navigator.geolocation) {
      setError('This browser does not support location access. Try the latest Chrome or Edge.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCoords(next);
        setLoading(false);
      },
      (geoError) => {
        setError(explainGeolocationError(geoError));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);
  const clearLocation = useCallback(() => {
    setCoords(null);
    setError('');
  }, []);
  return { coords, error, loading, getLocation, clearLocation, setCoords };
};
