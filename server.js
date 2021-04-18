const app = require('./app');

// Port Binding
const PORT = process.env.PORT || '3000';

const server = app.listen(PORT, () => {
  console.log(
    `Running in ${process.env.NODE_ENV} mode on port: ${PORT}`.yellow,
  );
});

// Handle unhandled rejections
process.on('unhandledRejection', (error, promise) => {
  console.log(`[Unhandled Rejection] ${error.message}`.red);
  // Close server and exit out of the applicaton
  server.close(() => process.exit(1));
});
