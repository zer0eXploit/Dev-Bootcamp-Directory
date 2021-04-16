// Modules
const express = require('express');
const rateLimiter = require('express-rate-limit');

// Controlles
const {
  authRegister,
  authLogin,
  authLogout,
  authForgotPassword,
  authResetPassword,
  authGetMe,
  authUpdateInfo,
  authUpdatePassword,
} = require('../controllers/auth');

// Middlewares
const { protect } = require('../middlewares/auth');

const router = express.Router();

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many forgot password requests. Please try again after 5 mins.',
  },
});

router.route('/register').post(authRegister);
router.route('/login').post(authLogin);
router.route('/logout').get(authLogout);
router.route('/forgot-password').post(limiter, authForgotPassword);
router.route('/reset-password/:resetToken').put(authResetPassword);
router.route('/me').get(protect, authGetMe);
router.route('/me/update-info').put(protect, authUpdateInfo);
router.route('/me/update-password').put(protect, authUpdatePassword);

module.exports = router;
