export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPriceSuffix = (type) => type === 'hotel' ? '/night' : '/month';

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
const apiOrigin = apiBase.startsWith('http') ? new URL(apiBase).origin : '';

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${apiOrigin}${url}`;
  return url;
};

export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return null;
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(1)} km away`;
};
