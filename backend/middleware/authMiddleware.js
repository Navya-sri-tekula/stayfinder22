const jwt = require('jsonwebtoken');
const { getModels } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stayfinder_jwt_secure_secret_key_2026');

    const { User } = getModels();
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: user not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

const optionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stayfinder_jwt_secure_secret_key_2026');
      const { User } = getModels();
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently continue without user
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: this action requires one of the following roles: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

const requireOwner = requireRole('owner');

module.exports = {
  verifyToken,
  optionalToken,
  requireRole,
  requireOwner,
};
