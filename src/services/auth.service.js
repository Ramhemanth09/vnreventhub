const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Generate JWT Token
 */
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Configure secure HTTP-Only Cookie options
 */
const getCookieOptions = () => {
  const days = parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS || '7', 10);
  return {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents XSS script access to the token
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' // CSRF protection
  };
};

/**
 * Register a new User
 */
const register = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email address is already registered', 409);
  }

  // Create new user (password is automatically hashed in pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'USER'
  });

  const token = signToken(user._id, user.role);

  return { user, token };
};

/**
 * Authenticate User Login
 */
const login = async ({ email, password }) => {
  // Explicitly select password field since it is omitted by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id, user.role);

  // Return clean user object without password
  const cleanUser = user.toJSON();

  return { user: cleanUser, token };
};

module.exports = {
  signToken,
  getCookieOptions,
  register,
  login
};
