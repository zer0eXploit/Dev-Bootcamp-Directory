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
  //   await User.deleteMany();

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
