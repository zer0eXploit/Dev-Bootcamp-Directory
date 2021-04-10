// Modules
const express = require('express');

// Controlles
const { authRegister } = require('../controllers/auth');

const router = express.Router();

router.route('/register').post(authRegister);

module.exports = router;
