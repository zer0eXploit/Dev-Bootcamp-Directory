const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/configs/config-test.env` });

module.exports = {
  color: true,
  recursive: true,
  watch: false,
};
