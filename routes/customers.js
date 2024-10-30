// server/routes/customers.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'); // Import validation middleware

// Middleware to authenticate and authorize admin
router.use(authMiddleware.authenticateJWT);
router.use(authMiddleware.authorizeAdmin);

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }); // Find users with role 'user'
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET a single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// UPDATE a customer by ID
router.put('/:id', 
  // Validate and sanitize inputs
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const customerId = req.params.id;
      const updatedData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      };

      const updatedCustomer = await User.findByIdAndUpdate(customerId, updatedData, { new: true });
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Customer updated successfully', customer: updatedCustomer });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE a customer by ID
router.delete('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const deletedCustomer = await User.findByIdAndDelete(customerId);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
