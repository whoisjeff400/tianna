// In server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
exports.authenticateJWT = (req, res, next) => {
  // Retrieve the authorization header
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.sendStatus(403); // Forbidden
      }

      // Attach user information to the request object
      req.user = user;
      next(); // Proceed to the next middleware or route handler
    });
  } else {
    console.error('Authorization header not found');
    res.sendStatus(401); // Unauthorized
  }
};

// Middleware to authorize admin users
exports.authorizeAdmin = (req, res, next) => {
  // Check if the user is authenticated and has the admin role
  if (req.user && req.user.role === 'admin') {
    next(); // Proceed if authorized
  } else {
    console.error('User not authorized as admin');
    res.sendStatus(403); // Forbidden
  }
};
