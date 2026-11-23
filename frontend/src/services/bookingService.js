import api from './api';
export const bookingService = {
  create: async (data) => (await api.post('/bookings', data)).data,
  getMine: async () => (await api.get('/bookings/my')).data,
  getOwnerRequests: async () => (await api.get('/bookings/owner')).data,
  updateStatus: async (id, status, owner_response = '') => (await api.patch('/bookings/' + id + '/status', { status, owner_response })).data,
  cancel: async (id) => (await api.patch('/bookings/' + id + '/cancel')).data,
};
