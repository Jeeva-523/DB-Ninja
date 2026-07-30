const ReportModel = require('../models/reportModel');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller for BI Analytics & Reports
 */
class ReportController {
  /**
   * Get Sales Report by Date Range
   */
  static async getSalesReport(req, res, next) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const startDate = req.query.startDate || thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = req.query.endDate || now.toISOString().split('T')[0];

      const report = await ReportModel.getSalesReport(startDate, endDate);
      return ApiResponse.success(res, 200, 'Sales report fetched successfully', {
        startDate,
        endDate,
        report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Top 10 Best Selling Products
   */
  static async getTopProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '10', 10);
      const products = await ReportModel.getTopProducts(limit);
      return ApiResponse.success(res, 200, 'Top selling products fetched successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Category Revenue Breakdown
   */
  static async getCategoryBreakdown(req, res, next) {
    try {
      const categories = await ReportModel.getCategoryBreakdown();
      return ApiResponse.success(res, 200, 'Category sales breakdown fetched successfully', { categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export Sales Report as CSV File Download
   */
  static async exportCsv(req, res, next) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const startDate = req.query.startDate || thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = req.query.endDate || now.toISOString().split('T')[0];

      const report = await ReportModel.getSalesReport(startDate, endDate);
      const csvData = ReportModel.generateSalesCsv(report);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ShopMaster_Sales_Report_${startDate}_to_${endDate}.csv`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
