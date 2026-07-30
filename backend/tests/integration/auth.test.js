const express = require('express');
const request = require('supertest');
const UserModel = require('../../models/userModel');
const { hashPassword } = require('../../utils/passwordUtils');

// Mock UserModel
jest.mock('../../models/userModel');

const app = express();
app.use(express.json());

const authRoutes = require('../../routes/authRoutes');
const errorHandler = require('../../middlewares/errorMiddleware');

app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

describe('Auth REST API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/auth/login should return 400 Bad Request when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'AdminPassword123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  test('POST /api/v1/auth/login should return 401 Unauthorized for non-existent user', async () => {
    UserModel.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@shopmaster.com', password: 'AdminPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('POST /api/v1/auth/login should return 200 OK and JWT tokens for valid credentials', async () => {
    const samplePassword = 'ValidPassword123!';
    const passwordHash = await hashPassword(samplePassword);

    const mockUser = {
      id: 1,
      name: 'Super Admin',
      email: 'admin@shopmaster.com',
      password_hash: passwordHash,
      is_active: 1,
      role_id: 1,
      role_name: 'super_admin'
    };

    UserModel.findByEmail.mockResolvedValue(mockUser);
    UserModel.saveRefreshToken.mockResolvedValue(true);
    UserModel.updateLastLogin.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@shopmaster.com', password: samplePassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@shopmaster.com');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
