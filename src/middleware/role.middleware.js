const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * Restricts access to specific user roles (e.g. 'ADMIN', 'USER').
 * @param  {...string} roles - Allowed roles
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Access denied. You do not have permission to perform this action.',
          403
        )
      );
    }
    next();
  };
};

module.exports = { allowRoles };
