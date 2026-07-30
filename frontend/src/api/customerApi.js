import axiosInstance from './axiosInstance';

export const customerApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/customers', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/customers', data);
    return response.data;
  },
  toggleStatus: async (id, isActive) => {
    const response = await axiosInstance.patch(`/customers/${id}/status`, { isActive });
    return response.data;
  },
  addAddress: async (id, addressData) => {
    const response = await axiosInstance.post(`/customers/${id}/addresses`, addressData);
    return response.data;
  }
};
