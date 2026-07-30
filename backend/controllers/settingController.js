const SettingModel = require('../models/settingModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller for Settings & Audit Logs
 */
class SettingController {
  /**
   * Get Settings
   */
  static async getSettings(req, res, next) {
    try {
      const settings = await SettingModel.getSettings();
      return ApiResponse.success(res, 200, 'Settings retrieved successfully', { settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update System Settings
   */
  static async updateSettings(req, res, next) {
    try {
      const { storeName, supportEmail, currency, taxRate, shippingFee } = req.body;
      await SettingModel.updateSettings({
        storeName,
        supportEmail,
        currency,
        taxRate,
        shippingFee
      });
      const settings = await SettingModel.getSettings();
      return ApiResponse.success(res, 200, 'Settings updated successfully', { settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Audit Logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 15 } = req.query;
      const logsData = await SettingModel.getAuditLogs({ page, limit });
      return ApiResponse.success(res, 200, 'Audit logs retrieved successfully', logsData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingController;
