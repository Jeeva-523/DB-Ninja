import axiosInstance from './axiosInstance';

export const settingApi = {
  getSettings: async () => {
    const response = await axiosInstance.get('/settings');
    return response.data;
  },
  updateSettings: async (data) => {
    const response = await axiosInstance.put('/settings', data);
    return response.data;
  },
  getAuditLogs: async (params = {}) => {
    const response = await axiosInstance.get('/settings/audit-logs', { params });
    return response.data;
  }
};
