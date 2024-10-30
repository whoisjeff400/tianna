const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.authenticateJWT, async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user.userId })
      .populate('service', 'name price')
      .exec();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', authMiddleware.authenticateJWT, async (req, res) => {
  try {
    const newAppointment = new Appointment({
      customer: req.user.userId,
      service: req.body.service,
      date: req.body.date,
      time: req.body.time
    });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ... routes for updating and cancelling appointments ...

module.exports = (db) => {
  // ... (route definitions) ...
  return router;
};

// Example in server/routes/appointments.js
import logger from '../logger';

// ...

try {
  // ...
} catch (error) {
  logger.error('Error creating appointment', { error, userId: req.user.userId });
  // ...
}