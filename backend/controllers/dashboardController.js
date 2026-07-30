const DashboardModel = require('../models/dashboardModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller for Admin Dashboard Analytics
 */
class DashboardController {
  /**
   * Get Summary KPI Metrics
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await DashboardModel.getSummary();
      return ApiResponse.success(res, 200, 'Dashboard summary metrics fetched successfully', { summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Revenue Trend Data
   */
  static async getRevenueTrend(req, res, next) {
    try {
      const days = parseInt(req.query.days || '30', 10);
      const trend = await DashboardModel.getRevenueTrend(days);
      return ApiResponse.success(res, 200, 'Revenue trend data fetched successfully', { trend });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Recent Orders List
   */
  static async getRecentOrders(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '5', 10);
      const orders = await DashboardModel.getRecentOrders(limit);
      return ApiResponse.success(res, 200, 'Recent orders fetched successfully', { orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
