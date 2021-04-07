const geocoder = require('node-geocoder');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEO_CODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEO_CODER_CONSUMER_KEY,
  formatter: null,
};

module.exports = NodeGeocoder(options);
