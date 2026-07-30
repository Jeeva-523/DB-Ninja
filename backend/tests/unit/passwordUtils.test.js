const { hashPassword, comparePassword } = require('../../utils/passwordUtils');

describe('Password Utilities Unit Tests', () => {
  const rawPassword = 'SuperSecretAdmin123!';

  test('hashPassword should generate a valid bcrypt hash starting with $2a$ or $2b$', async () => {
    const hash = await hashPassword(rawPassword);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    expect(hash).not.toBe(rawPassword);
  });

  test('comparePassword should return true for correct matching password', async () => {
    const hash = await hashPassword(rawPassword);
    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  test('comparePassword should return false for incorrect password', async () => {
    const hash = await hashPassword(rawPassword);
    const isValid = await comparePassword('WrongPassword999!', hash);
    expect(isValid).toBe(false);
  });
});
