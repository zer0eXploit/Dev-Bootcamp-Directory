const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review.'],
      maxlength: 100,
    },
    text: {
      type: String,
      trim: true,
      required: [true, 'Please add some text for review.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please give a rating between 1 and 10.'],
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: [true, 'Review must be associated with a bootcamp.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be linked to a user.'],
    },
  },
  {
    timestamps: { createdAt: 'firstCreated', updatedAt: 'lastUpdated' },
  },
);

module.exports = mongoose.model('Review', ReviewSchema);
