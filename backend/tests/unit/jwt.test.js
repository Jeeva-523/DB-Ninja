const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../../config/jwt');

describe('JWT Utility Module Unit Tests', () => {
  const userPayload = {
    userId: 42,
    email: 'testadmin@shopmaster.com',
    role: 'super_admin'
  };

  test('generateAccessToken should create signed JWT token and decode correctly', () => {
    const token = generateAccessToken(userPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(userPayload.userId);
    expect(decoded.email).toBe(userPayload.email);
    expect(decoded.role).toBe(userPayload.role);
  });

  test('generateRefreshToken should create signed refresh token and decode correctly', () => {
    const refreshToken = generateRefreshToken(userPayload);
    expect(refreshToken).toBeDefined();

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(userPayload.userId);
    expect(decoded.role).toBe(userPayload.role);
  });

  test('verifyAccessToken should throw error when provided invalid token', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    expect(() => verifyAccessToken(invalidToken)).toThrow();
  });
});
