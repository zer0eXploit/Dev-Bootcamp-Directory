// Modules
const express = require('express');

// Controlles
const { authRegister, authLogin } = require('../controllers/auth');

const router = express.Router();

router.route('/register').post(authRegister);
router.route('/login').post(authLogin);

module.exports = router;
