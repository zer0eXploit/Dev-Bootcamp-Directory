const express = require('express');
const router = express.Router();

// Routers
const courseRouter = require('./course');

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

router.route('/').get(getBootcamps).post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Get a list of courses inside a bootcamp
// Rather than importing the course controller here,
// and registering the controller,
// the route handler for courses is used.
// Since :bootcampID is used here, merge params must be
// passed to course router as an option.
router.use('/:bootcampID/courses', courseRouter);

router.route('/radius/:zipCode/:distance').get(getBootcampsWithinRadius);

router.route('/:id/photo').put(uploadBootcampPhoto);

module.exports = router;
