// server/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body, validationResult } = require('express-validator'); // Import validation middleware

// Middleware for handling validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Sign Up Route
router.post('/signup',
  // Validate and sanitize inputs
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      await authController.signup(req, res);
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Server Error' });
    }
});

// Login Route
router.post('/login',
  // Validate and sanitize inputs
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      await authController.login(req, res);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server Error' });
    }
});

// Google Login Routes
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body; // Expecting a token from the client
    await authController.googleLogin(token, res);
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Apple Login Route
router.post('/apple', async (req, res) => {
  try {
    const { authorizationCode } = req.body; // Expecting an authorization code from the client
    await authController.appleLogin(authorizationCode, res);
  } catch (error) {
    console.error('Error during Apple login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Password Reset Routes
router.post('/reset-password-request',
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      await authController.resetPasswordRequest(req, res);
    } catch (error) {
      console.error('Error during password reset request:', error);
      res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/reset-password/:token',
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      await authController.resetPassword(req, res);
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
