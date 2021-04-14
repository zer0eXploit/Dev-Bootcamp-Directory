// Modules
const express = require('express');

// Controlles
const {
  authRegister,
  authLogin,
  authForgotPassword,
  authResetPassword,
  authGetMe,
  authUpdateInfo,
  authUpdatePassword,
} = require('../controllers/auth');

// Middlewares
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(authRegister);
router.route('/login').post(authLogin);
router.route('/forgot-password').post(authForgotPassword);
router.route('/reset-password/:resetToken').put(authResetPassword);
router.route('/me').get(protect, authGetMe);
router.route('/me/update-info').put(protect, authUpdateInfo);
router.route('/me/update-password').put(protect, authUpdatePassword);

module.exports = router;
