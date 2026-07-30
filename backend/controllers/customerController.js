const CustomerModel = require('../models/customerModel');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { hashPassword } = require('../utils/passwordUtils');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Customer Management REST Controller
 */
class CustomerController {
  /**
   * Get Paginated Customer List
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const result = await CustomerModel.findAll({ page, limit, search, status });
      return ApiResponse.success(res, 200, 'Customers retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Customer Details & Address Book
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.findById(id);
      if (!customer) {
        throw ApiError.notFound(`Customer with ID ${id} not found`);
      }

      const addresses = await CustomerModel.getAddresses(id);
      return ApiResponse.success(res, 200, 'Customer details fetched successfully', {
        customer,
        addresses
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Customer Account
   */
  static async create(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw ApiError.badRequest('Email address is already registered');
      }

      let customerRole = await RoleModel.findByName('customer');
      let roleId = customerRole ? customerRole.id : 4;

      const passwordHash = await hashPassword(password || 'CustomerPass123!');
      const userId = await UserModel.create({
        roleId,
        name,
        email,
        passwordHash
      });

      const newCustomer = await CustomerModel.findById(userId);
      return ApiResponse.success(res, 201, 'Customer created successfully', { customer: newCustomer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle Customer Active / Blocked Status
   */
  static async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const customer = await CustomerModel.findById(id);
      if (!customer) {
        throw ApiError.notFound(`Customer with ID ${id} not found`);
      }

      await CustomerModel.toggleStatus(id, isActive);
      return ApiResponse.success(res, 200, `Customer status updated to ${isActive ? 'Active' : 'Blocked'}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add Customer Address
   */
  static async addAddress(req, res, next) {
    try {
      const { id } = req.params;
      const addressId = await CustomerModel.addAddress(id, req.body);
      const addresses = await CustomerModel.getAddresses(id);
      return ApiResponse.success(res, 201, 'Address added successfully', { addresses });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
