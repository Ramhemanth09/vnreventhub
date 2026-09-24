const authService = require('../services/auth.service');

/**
 * Register User Controller
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    // Send JWT token exclusively in HTTP-only secure cookie
    res.cookie('token', token, authService.getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User Controller
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    // Set HTTP-only Cookie
    res.cookie('token', token, authService.getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User Controller
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Clear the HTTP-only cookie
    res.cookie('token', 'loggedout', {
      expires: new Date(Date.now() + 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated User Profile Controller
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
