// server/routes/contact.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Make sure to install nodemailer: npm install nodemailer
const { body, validationResult } = require('express-validator');

// POST route for contact form submission
router.post(
  '/',
  [
    // Validate input fields
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('message').notEmpty().withMessage('Message cannot be empty'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    // Create a transporter using your email service credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Example: use 'gmail' or your email service provider
      auth: {
        user: 'your-email@gmail.com', // Replace with your email address
        pass: 'your-email-password', // Replace with your email password or app password
      },
    });

    // Define the email options
    const mailOptions = {
      from: email,
      to: 'salon@example.com', // Replace with the salon's email address
      subject: `Contact Form Submission from ${name}`,
      text: message,
    };

    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
