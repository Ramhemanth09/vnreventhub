const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');
const AppError = require('../utils/AppError');

/**
 * Authentication Middleware
 * Verifies JWT token from HTTP-only cookie and attaches authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Extract token primarily from HTTP-only cookie (or optional Authorization header fallback)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access.', 401)
      );
    }

    // 2) Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    let currentUser;
    if (getDBStatus()) {
      currentUser = await User.findById(decoded.id);
    } else {
      currentUser = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
    }

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Grant access and attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your token has expired! Please log in again.', 401)
      );
    }
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to req.user if valid token exists, but does not block unauthenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let currentUser;
    if (getDBStatus()) {
      currentUser = await User.findById(decoded.id);
    } else {
      currentUser = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
    }

    if (currentUser) {
      req.user = currentUser;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, optionalAuth };
