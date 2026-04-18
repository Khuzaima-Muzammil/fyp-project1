const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Make sure process.env.JWT_SECRET is defined in your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
    
    // Decoded token se user ID aur uska ROLE dono nikaal kar request mein daal rahe hain
    req.user = decoded.user; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};