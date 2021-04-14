// Modules
const express = require('express');

// Controlles
const {
  authRegister,
  authLogin,
  authForgotPassword,
  authResetPassword,
  authGetMe,
} = require('../controllers/auth');

// Middlewares
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(authRegister);
router.route('/login').post(authLogin);
router.route('/forgot-password').post(authForgotPassword);
router.route('/reset-password/:resetToken').put(authResetPassword);
router.route('/me').get(protect, authGetMe);

module.exports = router;
