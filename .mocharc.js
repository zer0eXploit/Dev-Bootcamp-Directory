const dotenv = require('dotenv');

dotenv.config({ path: './configs/config-test.env' });

module.exports = {
  color: true,
  recursive: true,
  watch: false,
};
