const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const connectDB = require('./configs/db');
const errorHandler = require('./middlewares/errorHandler');

// Load ENV vars
dotenv.config({ path: './configs/config.env' });

// Connect to DB
connectDB();

// Routers
const bootcamp = require('./routes/bootcamp');
const course = require('./routes/course');
const auth = require('./routes/auth');
const user = require('./routes/user');

// App initialization
const app = express();

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Apply Middlewares
app.use(express.json());

if (process.env.NODE_ENV === 'Development') {
  app.use(morgan('dev'));
}

app.use(fileUpload());
app.use(cookieParser());

// Mount Routers
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', course);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);

// Error Handler Middleware
// Call only after mounting routers
// to catch errors occurred on routes
app.use(errorHandler);

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
