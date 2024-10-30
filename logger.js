// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Define the custom format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger instance
const logger = createLogger({
  level: 'info', // Minimum level of messages to log
  format: combine(
    timestamp(),   // Add timestamp to log messages
    colorize(),    // Colorize the output (for better readability in terminal)
    logFormat      // Apply custom format
  ),
  transports: [
    new transports.Console(), // Output logs to the console
    new transports.File({ filename: 'app.log' }) // Log to a file
  ],
});

module.exports = logger;
