const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Auth Controller Handling Auth Business Logic
 */
class AuthController {
  /**
   * User Login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Fetch user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // 2. Check if account is active
      if (!user.is_active) {
        throw ApiError.forbidden('Your account has been deactivated. Please contact Super Admin.');
      }

      // 3. Verify password hash using bcrypt
      const isPasswordMatch = await comparePassword(password, user.password_hash);
      if (!isPasswordMatch) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // 4. Generate Access & Refresh Tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role_name
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 5. Store Refresh Token session in DB (Expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await UserModel.saveRefreshToken(user.id, refreshToken, expiresAt);

      // 6. Update Last Login Timestamp
      await UserModel.updateLastLogin(user.id);

      // 7. Format clean User Object (excluding password hash)
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
      };

      return ApiResponse.success(res, 200, 'Login successful', {
        user: userProfile,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register User (Super Admin only or Seeding)
   */
  static async register(req, res, next) {
    try {
      const { roleId, name, email, password } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw ApiError.badRequest('User with this email already exists');
      }

      const passwordHash = await hashPassword(password);
      const userId = await UserModel.create({ roleId, name, email, passwordHash });
      const newUser = await UserModel.findById(userId);

      return ApiResponse.success(res, 201, 'User account registered successfully', {
        user: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT Access Token
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw ApiError.badRequest('Refresh token is required');
      }

      // Verify token in DB session
      const savedToken = await UserModel.findRefreshToken(refreshToken);
      if (!savedToken) {
        throw ApiError.unauthorized('Invalid or expired refresh token session');
      }

      const decoded = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      return ApiResponse.success(res, 200, 'Token refreshed successfully', {
        accessToken: newAccessToken
      });
    } catch (error) {
      next(ApiError.unauthorized('Invalid refresh token'));
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        throw ApiError.notFound('User profile not found');
      }
      return ApiResponse.success(res, 200, 'User profile fetched successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout User (Revoke Refresh Token)
   */
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await UserModel.deleteRefreshToken(refreshToken);
      }
      return ApiResponse.success(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
