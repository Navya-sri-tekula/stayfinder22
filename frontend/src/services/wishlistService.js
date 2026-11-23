import api from './api';

export const wishlistService = {
  getAll: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },

  add: async (propertyId) => {
    const res = await api.post('/wishlist', { property_id: propertyId });
    return res.data;
  },

  remove: async (propertyId) => {
    const res = await api.delete(`/wishlist/${propertyId}`);
    return res.data;
  },
};
