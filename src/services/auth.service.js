const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');
const AppError = require('../utils/AppError');

/**
 * Generate JWT Token
 */
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_campus_event_management_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Configure secure HTTP-Only Cookie options for Production & Local environments
 */
const getCookieOptions = () => {
  const days = parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS || '7', 10);
  const isProd = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd, // HTTPS in production
    sameSite: 'lax', // Standard CSRF protection across modern browsers
    path: '/'
  };
};

/**
 * Register a new User with full student profile information
 */
const register = async ({
  name,
  rollNo = '',
  year = '',
  branch = '',
  section = '',
  mobileNo = '',
  email,
  password,
  role = 'USER'
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (getDBStatus()) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('Email address is already registered', 409);
    }

    const user = await User.create({
      name,
      rollNo: rollNo ? rollNo.trim().toUpperCase() : '',
      year: year ? year.trim() : '',
      branch: branch ? branch.trim().toUpperCase() : '',
      section: section ? section.trim().toUpperCase() : '',
      mobileNo: mobileNo ? mobileNo.trim() : '',
      email: normalizedEmail,
      password,
      role: role || 'USER'
    });

    const token = signToken(user._id, user.role);
    return { user, token };
  } else {
    // In-Memory Fallback Mode
    const existingUser = memoryStore.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existingUser) {
      throw new AppError('Email address is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: memoryStore.generateId(),
      name,
      rollNo: rollNo ? rollNo.trim().toUpperCase() : '',
      year: year ? year.trim() : '',
      branch: branch ? branch.trim().toUpperCase() : '',
      section: section ? section.trim().toUpperCase() : '',
      mobileNo: mobileNo ? mobileNo.trim() : '',
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryStore.users.push(newUser);

    const token = signToken(newUser._id, newUser.role);
    const cleanUser = { ...newUser };
    delete cleanUser.password;

    return { user: cleanUser, token };
  }
};

/**
 * Authenticate User Login
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (getDBStatus()) {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id, user.role);
    const cleanUser = user.toJSON();
    return { user: cleanUser, token };
  } else {
    // In-Memory Mode
    const user = memoryStore.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id, user.role);
    const cleanUser = { ...user };
    delete cleanUser.password;

    return { user: cleanUser, token };
  }
};

module.exports = {
  signToken,
  getCookieOptions,
  register,
  login
};
