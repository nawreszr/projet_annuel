const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
  // Vérifier le token JWT
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  },

  // Vérifier le rôle de l'utilisateur
  requireRole: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  },

  // Vérifier si l'utilisateur est propriétaire de la ressource
  isOwner: (model) => {
    return async (req, res, next) => {
      try {
        const resource = await model.findById(req.params.id);
        
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        if (resource.userId && resource.userId.toString() !== req.user.userId) {
          return res.status(403).json({ error: 'Not authorized to access this resource' });
        }

        next();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }
};

module.exports = authMiddleware;
