const PaymentModel = require('../models/paymentModel');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Payment Gateway Controller
 */
class PaymentController {
  /**
   * Get Paginated Payments
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const result = await PaymentModel.findAll({ page, limit, search, status });
      return ApiResponse.success(res, 200, 'Payment ledger retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Payment Transaction Details
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.findById(id);
      if (!payment) {
        throw ApiError.notFound(`Payment transaction #${id} not found`);
      }
      return ApiResponse.success(res, 200, 'Payment details fetched successfully', { payment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process simulated / Gateway Payment
   */
  static async processPayment(req, res, next) {
    try {
      const { orderId, amount, paymentMethod, gateway } = req.body;

      // Simulated Gateway Transaction ID Generation (e.g. txn_stripe_987123)
      const transactionId = `txn_${gateway || 'stripe'}_${Date.now()}`;

      const paymentId = await PaymentModel.processPayment({
        orderId,
        userId: req.user?.userId || 1,
        paymentMethod: paymentMethod || 'credit_card',
        transactionId,
        amount,
        gateway: gateway || 'stripe',
        rawResponse: {
          gateway_status: 'succeeded',
          charged_amount: amount,
          currency: 'usd',
          timestamp: new Date().toISOString()
        }
      });

      const payment = await PaymentModel.findById(paymentId);
      return ApiResponse.success(res, 201, 'Payment processed successfully', { payment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Issue Refund
   */
  static async refund(req, res, next) {
    try {
      const { id } = req.params;
      await PaymentModel.issueRefund(id);
      return ApiResponse.success(res, 200, `Refund issued successfully for transaction #${id}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
