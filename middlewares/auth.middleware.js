const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const config= require('../config/local');

dotenv.config();

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token and extract user data
    const decoded = jwt.verify(token, config.jwtAuthSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const isEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied, employers only' });
  }
  next();
};

module.exports = { protect, isEmployer };
