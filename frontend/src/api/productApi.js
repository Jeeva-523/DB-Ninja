import axiosInstance from './axiosInstance';

export const productApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  adjustStock: async (id, data) => {
    const response = await axiosInstance.patch(`/products/${id}/stock`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  }
};
