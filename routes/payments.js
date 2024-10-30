const express = require('express');
const router = express.Router();
const paystack = require('paystack')('your-secret-key'); // Replace with your Paystack secret key
const Appointment = require('../models/appointment');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/initialize', authMiddleware.authenticateJWT, async (req, res) => {
  try {
    const appointmentId = req.body.appointmentId;
    const appointment = await Appointment.findById(appointmentId).populate('service', 'price').exec();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const transaction = await paystack.transaction.initialize({
      amount: appointment.service.price * 100, // Amount in kobo
      email: req.user.email,
      reference: generateReference(), // Generate a unique reference
      callback_url: 'http://localhost:3000/payment/verify' // Replace with your frontend callback URL
    });

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const reference = req.query.reference;
    const transaction = await paystack.transaction.verify(reference);

    // Update appointment status to 'confirmed'
    await Appointment.findByIdAndUpdate(transaction.data.metadata.appointmentId, { status: 'confirmed' });

    // Redirect to frontend success page
    res.redirect(`http://localhost:3000/payment/success?reference=${reference}`);
  } catch (error) {
    console.error(error);
    // Redirect to frontend failure page
    res.redirect(`http://localhost:3000/payment/failure?reference=${reference}`);
  }
});

// Helper function to generate a unique reference
function generateReference() {
  // Implement your logic to generate a unique reference
}

module.exports = router;