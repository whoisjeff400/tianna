const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.authenticateJWT);

router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/me/notifications', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      notificationPreferences: req.body
    });
    res.json({ message: 'Notification preferences updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;