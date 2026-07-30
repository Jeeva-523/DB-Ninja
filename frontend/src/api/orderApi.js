import axiosInstance from './axiosInstance';

export const orderApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/orders', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/orders', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
