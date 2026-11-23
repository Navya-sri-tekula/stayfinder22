import api from './api';

export const reviewService = {
  getByPropertyId: async (propertyId) => {
    const res = await api.get(`/reviews/property/${propertyId}`);
    return res.data;
  },

  create: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};
