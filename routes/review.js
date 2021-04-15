const express = require('express');

// Controllers
const { getReviews, getReview } = require('../controllers/review');

// Models
const Review = require('../models/Review');

// Middlewares
const advancedResults = require('../middlewares/advancedResults');
const { protect } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

// Requests to /bootcamps/:bootcampID/reviews also hit here
// because of the forwarding at ./routes/bootcamp.js
const toPopulate = {
  path: 'bootcamp',
  select: 'name description',
};

router.route('/').get(advancedResults(Review, toPopulate), getReviews);

router.route('/:id').get(getReview);

module.exports = router;
