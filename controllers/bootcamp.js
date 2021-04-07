const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const queryParams = ['select', 'sortBy'];

  queryParams.map((field) => delete reqQuery[field]);

  let queryStr = JSON.stringify(reqQuery);

  // \b is word boundary
  // any word that is not inside \w is a word boundary
  // for example in 'hello-world' dash is a word boundary
  // because gt, lt, etc., are surrounded by quotes: "gt" like so,
  // they fall between word boundaries

  const regex = /\b(gt|lt|lte|gte|in)\b/g;
  queryStr = queryStr.replace(regex, (match) => `$${match}`);

  const query = Bootcamp.find(JSON.parse(queryStr));

  // if select is present in query string strips the values
  if (req.query.select) {
    query.select(req.query.select.split(',').join(' '));
  }

  if (req.query.sortBy) {
    query.sort(req.query.sortBy.split(',').join(' '));
  } else {
    query.sort('-firstCreated');
  }

  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Get info of a specific bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update info of a specific bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp)
    next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete a specific bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get a list of bootcamps that are within a given radius
// @route   GET /api/v1/bootcamps/radius/:zipCode/:distance
// @access  Public
exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
  const { zipCode, distance } = req.params;
  const [geoData] = await geocoder.geocode(zipCode);
  const earthRadius = 3963.2; // Miles
  const radians = Number(distance) / earthRadius;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[geoData.longitude, geoData.latitude], radians],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
