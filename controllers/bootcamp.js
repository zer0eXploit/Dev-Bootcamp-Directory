const path = require('path');

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;

  const bootCampExists = await Bootcamp.findOne({
    user: _id,
  });

  if (bootCampExists && role !== 'admin') {
    return next(
      new ErrorResponse(
        `A bootcamp is already created by the user ${_id}.`,
        403,
      ),
    );
  }

  // Add user id to req.body
  req.body.user = _id;

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
  const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');

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
  const { _id, role } = req.user;

  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  // Check if current user is not an owner or an admin
  if (!bootcamp.user.equals(_id) && role !== 'admin') {
    next(
      new ErrorResponse(`Permission denied to modify ${req.params.id}.`, 403),
    );
  }

  // Permissions clear because user is the owner and an admin
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete a specific bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  // Check if current user is not an owner and an admin
  if (!bootcamp.user.equals(_id) && role !== 'admin') {
    next(
      new ErrorResponse(`Permission denied to delete ${req.params.id}.`, 403),
    );
  }

  // Permissions clear because user is the owner or an admin
  bootcamp.remove();

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

// @desc    Upload bootcamp photo
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Resource with ID ${req.params.id} is not found.`, 404),
    );

  // Check if current user is not an owner and an admin
  if (!bootcamp.user.equals(_id) && role !== 'admin') {
    next(
      new ErrorResponse(
        `Permission denied to upload photo for ${req.params.id}.`,
        403,
      ),
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo.`, 400));
  }

  const file = req.files.file;

  // if the uploaded file is not from field name = file
  if (!file) {
    return next(
      new ErrorResponse(
        `Please upload the photo from the field name of file.`,
        400,
      ),
    );
  }

  // Check if image or not
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file.`, 400));
  }

  // Check if larger than allowed limit
  if (file.size > process.env.FILE_SIZE_LIMIT_BYTES) {
    return next(new ErrorResponse(`File size larger than 5MB.`, 413));
  }

  // Create a unique filename
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;

  const imagePath = `${process.env.UPLOAD_FOLDER}/${file.name}`;

  file.mv(imagePath, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Error saving bootcamp photo.`, 500));
    }

    await Bootcamp.findByIdAndUpdate(bootcamp.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: {
        imagUrl: `${process.env.DOMAIN_NAME}/images/bootcamps/${file.name}`,
      },
    });
  });
});
