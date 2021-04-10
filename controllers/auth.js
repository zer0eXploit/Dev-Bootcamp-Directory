// Models
const User = require('../models/User');

// Middlewares
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.authRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Logs a user in
// @route   POST /api/v1/auth/login
// @access  Public
exports.authLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorResponse(`Please enter username and password.`, 400));

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user) return next(new ErrorResponse(`Bad credentials.`, 401));

  const pwCorrect = await user.isPasswordCorrect(password);

  if (!pwCorrect) return next(new ErrorResponse(`Bad credentials.`, 401));

  sendTokenResponse(user, 200, res);
});

// @desc    Get logged in user information.
// @route   GET /api/v1/auth/me
// @access  Private
exports.authGetMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse(`User not found.`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Attach cookie to response and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedToken();

  const option = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 3600 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'Production') {
    option.secure = true;
  }

  return res.status(statusCode).cookie('token', token, option).json({
    success: true,
    token,
  });
};
