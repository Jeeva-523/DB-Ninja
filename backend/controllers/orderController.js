const OrderModel = require('../models/orderModel');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Order Controller Handling Order Fulfillment Operations
 */
class OrderController {
  /**
   * Get Paginated Orders List
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const result = await OrderModel.findAll({ page, limit, search, status });
      return ApiResponse.success(res, 200, 'Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Full Order Details
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);
      if (!order) {
        throw ApiError.notFound(`Order #${id} not found`);
      }
      return ApiResponse.success(res, 200, 'Order details fetched successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Place / Create Order
   */
  static async create(req, res, next) {
    try {
      const { customerId, shippingAddressId, items, shippingCost, taxAmount, notes } = req.body;
      const orderId = await OrderModel.createOrder({
        customerId,
        shippingAddressId,
        items,
        shippingCost,
        taxAmount,
        notes
      });

      const newOrder = await OrderModel.findById(orderId);
      return ApiResponse.success(res, 201, 'Order created successfully', { order: newOrder });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Order Fulfillment Status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await OrderModel.updateStatus(id, status);
      const updatedOrder = await OrderModel.findById(id);

      return ApiResponse.success(res, 200, `Order #${id} status updated to '${status}'`, { order: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
