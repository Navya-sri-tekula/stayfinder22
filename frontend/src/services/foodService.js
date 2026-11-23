import api from './api';

export const foodService = {
  getByPropertyId: async (propertyId) => {
    const res = await api.get(`/food/property/${propertyId}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/food', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/food/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/food/${id}`);
    return res.data;
  },
};
