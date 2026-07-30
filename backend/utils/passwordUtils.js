const bcrypt = require('bcryptjs');

/**
 * Enterprise Password Hashing and Comparison Utilities
 */

const SALT_ROUNDS = 10;

/**
 * Hash plain text password using bcrypt salt
 */
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(plainPassword, salt);
};

/**
 * Compare plain text password against hashed password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
