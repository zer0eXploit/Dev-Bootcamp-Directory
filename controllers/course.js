const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampID/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampID) {
    query = Course.find({
      bootcamp: req.params.bootcampID,
    });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with ID ${req.params.id} is not found.`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Create a course under a bootcamp
// @route   POST /api/v1/bootcamps/:bootcampID/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampID;

  const bootcamp = await Bootcamp.findById(req.params.bootcampID);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with ID ${req.params.bootcampID} is not found.`,
        404,
      ),
    );
  }

  course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});
