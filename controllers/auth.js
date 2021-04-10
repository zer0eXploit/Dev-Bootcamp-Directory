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

  const token = user.getSignedToken();

  res.status(200).json({
    success: true,
    token,
  });
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

  res.status(200).json({
    token: user.getSignedToken(),
  });
});
