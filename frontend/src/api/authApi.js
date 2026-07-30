import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  logout: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/logout', { refreshToken });
    return response.data;
  }
};
