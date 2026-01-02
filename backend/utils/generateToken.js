const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret_key', {
    expiresIn: '15m', // 15 minutes for access token
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', {
    expiresIn: '30d', // 30 days for refresh token
  });
};

module.exports = { generateAccessToken, generateRefreshToken };