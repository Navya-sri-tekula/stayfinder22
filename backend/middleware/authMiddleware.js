const jwt = require('jsonwebtoken');
const { getModels } = require('../models');
const { getJwtSecret } = require('../utils/jwt');
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
    const { User } = getModels();
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token: user not found.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};
const optionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
      const { User } = getModels();
      const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      if (user) req.user = user;
    }
  } catch (error) {
    // Continue as a public request when an optional token is invalid.
  }
  next();
};
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  next();
};
module.exports = { verifyToken, optionalToken, requireRole, requireOwner: requireRole('owner') };
