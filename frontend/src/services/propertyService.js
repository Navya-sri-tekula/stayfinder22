import api from './api';

export const propertyService = {
  getAll: async (params = {}) => {
    const res = await api.get('/properties', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/properties', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  },

  uploadImages: async (propertyId, formData) => {
    const res = await api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteImage: async (propertyId, imageId) => {
    const res = await api.delete(`/properties/${propertyId}/images/${imageId}`);
    return res.data;
  },

  getMyProperties: async () => {
    const res = await api.get('/properties/owner/my-properties');
    return res.data;
  },

  getOwnerStats: async () => {
    const res = await api.get('/properties/owner/dashboard-stats');
    return res.data;
  },

  addFacility: async (propertyId, facilityName) => {
    const res = await api.post(`/properties/${propertyId}/facilities`, { facility_name: facilityName });
    return res.data;
  },

  deleteFacility: async (propertyId, facilityId) => {
    const res = await api.delete(`/properties/${propertyId}/facilities/${facilityId}`);
    return res.data;
  },

  addRule: async (propertyId, rule) => {
    const res = await api.post(`/properties/${propertyId}/rules`, rule);
    return res.data;
  },

  deleteRule: async (propertyId, ruleId) => {
    const res = await api.delete(`/properties/${propertyId}/rules/${ruleId}`);
    return res.data;
  },
};
