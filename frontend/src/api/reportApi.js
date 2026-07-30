import axiosInstance from './axiosInstance';

export const reportApi = {
  getSalesReport: async (startDate, endDate) => {
    const response = await axiosInstance.get('/reports/sales', {
      params: { startDate, endDate }
    });
    return response.data;
  },
  getTopProducts: async (limit = 10) => {
    const response = await axiosInstance.get(`/reports/top-products?limit=${limit}`);
    return response.data;
  },
  getCategoryBreakdown: async () => {
    const response = await axiosInstance.get('/reports/category-breakdown');
    return response.data;
  },
  exportCsvUrl: (startDate, endDate) => {
    const token = localStorage.getItem('accessToken');
    return `/api/v1/reports/export/csv?startDate=${startDate || ''}&endDate=${endDate || ''}&token=${token}`;
  }
};
