const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Try to get token from 'x-auth-token' header or 'Authorization' header
  let token = req.header('x-auth-token');

  // If no x-auth-token, check Authorization header (standard: Bearer <token>)
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Make sure process.env.JWT_SECRET is defined in your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
    
    // Extract user ID and ROLE from the decoded token and add them to the request object
    req.user = decoded.user; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};