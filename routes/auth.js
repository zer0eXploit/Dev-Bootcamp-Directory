// Modules
const express = require('express');

// Controlles
const { authRegister, authLogin, authGetMe } = require('../controllers/auth');

// Middlewares
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(authRegister);
router.route('/login').post(authLogin);
router.route('/me').get(protect, authGetMe);

module.exports = router;
