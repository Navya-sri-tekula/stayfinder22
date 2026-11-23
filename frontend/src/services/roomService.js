import api from './api';

export const roomService = {
  getByPropertyId: async (propertyId) => {
    const res = await api.get(`/rooms/property/${propertyId}`);
    return res.data;
  },

  create: async (roomData) => {
    const res = await api.post('/rooms', roomData);
    return res.data;
  },

  update: async (id, roomData) => {
    const res = await api.put(`/rooms/${id}`, roomData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
};
