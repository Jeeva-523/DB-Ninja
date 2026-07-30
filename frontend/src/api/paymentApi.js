import axiosInstance from './axiosInstance';

export const paymentApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/payments', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },
  processPayment: async (data) => {
    const response = await axiosInstance.post('/payments/process', data);
    return response.data;
  },
  refund: async (id) => {
    const response = await axiosInstance.post(`/payments/${id}/refund`);
    return response.data;
  }
};
