import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getSummary: async () => {
    const response = await axiosInstance.get('/dashboard/summary');
    return response.data;
  },
  getRevenueTrend: async (days = 30) => {
    const response = await axiosInstance.get(`/dashboard/revenue-trend?days=${days}`);
    return response.data;
  },
  getRecentOrders: async (limit = 5) => {
    const response = await axiosInstance.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  }
};
