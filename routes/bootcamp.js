const express = require('express');
const router = express.Router();

// Controllers
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
} = require('../controllers/bootcamp');

router.route('/').get(getBootcamps).post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipCode/:distance').get(getBootcampsWithinRadius);

module.exports = router;
