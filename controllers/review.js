// Models
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// Middlewares
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampID/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampID,
    }).populate({
      path: 'user',
      select: 'name',
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name',
    })
    .populate({
      path: 'bootcamp',
      select: 'name',
    });

  if (!review)
    return next(
      new ErrorResponse(`Review with ID ${req.params.id} is not found.`, 404),
    );

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add a review
// @route   POST /api/v1/bootcamps/:bootcampID/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampID;
  req.body.user = req.user._id;

  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review with ID ${req.params.id} is not found.`, 404),
    );
  }

  // Check if current user is not an owner or an admin
  if (!review.user.equals(_id) && role !== 'admin')
    next(new ErrorResponse(`Permission denied to update the review.`, 403));

  // Used this way to update because,
  // there is no post mongoose hook for findByIdAndUpdate
  await Review.updateOne({ _id: req.params.id }, req.body, {
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Fields updated.',
    },
  });
});
