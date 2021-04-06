const express = require('express');
const dotenv = require('dotenv');

// Load ENV vars
dotenv.config({ path: './configs/config.env' });

// App initialization
const app = express();

const PORT = process.env.PORT || '3000';

app.listen(PORT, () => {
  console.log(`Running in ${process.env.NODE_ENV} mode on port ${PORT}...`);
});
