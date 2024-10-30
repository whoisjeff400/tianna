// server/index.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const customersRoutes = require('./routes/customers');
const authRoutes = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contact');
const cron = require('node-cron');
const notificationService = require('./Services/notificationService');
const Appointment = require('./models/appointment');
const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection string from environment variables
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@<cluster-address>/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(process.env.DB_NAME);

    // Use routes
    app.use('/api/services', servicesRoutes(db));
    app.use('/api/appointments', appointmentsRoutes(db));
    app.use('/api/customers', customersRoutes(db));
    app.use('/api/auth', authRoutes);
    app.use('/api/payments', paymentsRoutes);
    app.use('/api/contact', contactRoutes);

    // Schedule a task to send appointment reminders every hour
    cron.schedule('0 * * * *', async () => {
      try {
        const appointments = await Appointment.find({
          date: { $gte: new Date() },
          status: 'confirmed',
          reminderSent: false,
        })
          .populate('customer', 'email name phone notificationPreferences')
          .populate('service', 'name')
          .exec();

        for (const appointment of appointments) {
          const timeDiffInHours = Math.ceil(
            (appointment.date.getTime() - Date.now()) / (1000 * 60 * 60)
          );

          if (timeDiffInHours <= 24) {
            await notificationService.sendAppointmentReminder(appointment);
            await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
          }
        }
      } catch (error) {
        console.error('Error running reminder task:', error);
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the application on database connection failure
  });
