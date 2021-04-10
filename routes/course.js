const express = require('express');

// Controllers
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course');

// Models
const Course = require('../models/Course');

// Middlewares
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

// Requests to /bootcamps/:bootcampID/courses also hit here
// because of the forwarding at ./routes/bootcamp.js
const toPopulate = {
  path: 'bootcamp',
  select: 'name description',
};

router
  .route('/')
  .get(advancedResults(Course, toPopulate), getCourses)
  .post(protect, authorize('publisher', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
