const express = require('express');
const router = express.Router();

// Routers
const courseRouter = require('./course');
const reviewRouter = require('./review');

// Models
const Bootcamp = require('../models/Bootcamp');

// Middlewares
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

// Controllers
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  uploadBootcampPhoto,
} = require('../controllers/bootcamp');

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// Get a list of courses inside a bootcamp
// Rather than importing the course controller here,
// and registering the controller,
// the route handler for courses is used.
// Since :bootcampID is used here, merge params must be
// passed to course router as an option.
router.use('/:bootcampID/courses', courseRouter);

// same as above but for reviews
router.use('/:bootcampID/reviews', reviewRouter);

router.route('/radius/:zipCode/:distance').get(getBootcampsWithinRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadBootcampPhoto);

module.exports = router;
