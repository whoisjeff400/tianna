// In server/models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure that email is unique across users
    trim: true, // Remove whitespace from both ends
    lowercase: true, // Convert email to lowercase for consistency
    validate: {
      validator: function(v) {
        // Basic regex for email validation
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for password
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Allow only 'user' or 'admin' as roles
    default: 'user', // Default role
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt timestamps
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (user.isModified('password')) {
    try {
      user.password = await bcrypt.hash(user.password, 8); // Hash with a salt rounds of 8
    } catch (error) {
      return next(error); // Handle error during hashing
    }
  }
  next(); // Proceed to save the user
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  const user = this;
  return bcrypt.compare(candidatePassword, user.password); // Compare provided password with hashed password
};

// Static method to find user by email
userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email }); // Return user by email
};

// Method to update notification preferences
userSchema.methods.updateNotificationPreferences = async function(preferences) {
  const user = this;
  user.notificationPreferences = preferences; // Update notification preferences
  await user.save(); // Save changes
  return user; // Return updated user
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
