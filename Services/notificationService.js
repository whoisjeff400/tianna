const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Set SendGrid API Key
sgMail.setApiKey('your-sendgrid-api-key'); // Replace with your SendGrid API key

// Initialize Twilio client
const twilioClient = new twilio(
  'your-twilio-account-sid', // Replace with your Twilio Account SID
  'your-twilio-auth-token' // Replace with your Twilio Auth Token
);

/**
 * Send booking confirmation via email and SMS.
 * @param {Object} appointment - Appointment details.
 */
exports.sendBookingConfirmation = async (appointment) => {
  try {
    // Check notification preferences
    if (appointment.customer.notificationPreferences.email) {
      // Send email confirmation
      const emailMsg = {
        to: appointment.customer.email,
        from: 'your-email-address', // Replace with your email address
        subject: 'Tianna Salon Booking Confirmation',
        text: `Dear ${appointment.customer.name},\n\nYour appointment for ${appointment.service.name} on ${appointment.date} at ${appointment.time} has been confirmed.\n\nThank you for choosing Tianna Salon!`,
      };

      await sgMail.send(emailMsg);
      console.log('Email confirmation sent successfully');
    }

    if (appointment.customer.notificationPreferences.sms) {
      // Send SMS confirmation
      const smsMsg = await twilioClient.messages.create({
        body: `Tianna Salon: Your appointment for ${appointment.service.name} on ${appointment.date} at ${appointment.time} is confirmed.`,
        to: appointment.customer.phone,
        from: 'your-twilio-phone-number', // Replace with your Twilio phone number
      });

      console.log('SMS confirmation sent successfully');
    }

    console.log('Confirmation notifications sent (if applicable)');
  } catch (error) {
    console.error('Error sending confirmation:', error);
  }
};

/**
 * Send appointment reminder via email and SMS.
 * @param {Object} appointment - Appointment details.
 */
exports.sendAppointmentReminder = async (appointment) => {
  try {
    // Check notification preferences
    if (appointment.customer.notificationPreferences.email) {
      // Send email reminder
      const emailMsg = {
        to: appointment.customer.email,
        from: 'your-email-address', // Replace with your email address
        subject: 'Tianna Salon Appointment Reminder',
        text: `Dear ${appointment.customer.name},\n\nThis is a reminder about your upcoming appointment for ${appointment.service.name} on ${appointment.date} at ${appointment.time}.\n\nWe look forward to seeing you!\n\nTianna Salon`,
      };

      await sgMail.send(emailMsg);
      console.log('Email reminder sent successfully');
    }

    if (appointment.customer.notificationPreferences.sms) {
      // Send SMS reminder
      const smsMsg = await twilioClient.messages.create({
        body: `Tianna Salon: Reminder for your ${appointment.service.name} appointment on ${appointment.date} at ${appointment.time}.`,
        to: appointment.customer.phone,
        from: 'your-twilio-phone-number', // Replace with your Twilio phone number
      });

      console.log('SMS reminder sent successfully');
    }

    console.log('Reminder notifications sent (if applicable)');
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
};
