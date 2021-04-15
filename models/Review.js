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

// Prevent user from submitting more than one comment per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.setAverageRating = async function (bootcampID) {
  // Calculate the average rating
  const avgRating = await this.aggregate([
    { $match: { bootcamp: bootcampID } },
    {
      $group: {
        _id: '$bootcamp',
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  // Insert into db
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampID, {
      averageRating: avgRating[0]['avgRating'],
    });
  } catch (e) {
    console.log(e);
  }
};

// Recalculate the average on each addition or removal of a review
ReviewSchema.pre('save', function (next) {
  // this.constructor is the Review Model itself
  // because 'this' is an instance of the Review model
  this.constructor.setAverageRating(this.bootcamp);
  next();
});

ReviewSchema.pre('remove', function (next) {
  // this.constructor is the Review Model itself
  this.constructor.setAverageRating(this.bootcamp);
  next();
});

ReviewSchema.post('updateOne', async function () {
  // just checking if the rating field is present
  // assuming fields that are going to be updated are passed to request body
  if (!this._update['$set'].rating) return;

  // couldn't access document being updated here
  // refer to mongoose docs
  const docToUpdate = await this.model.findOne(this.getQuery());
  docToUpdate.constructor.setAverageRating(docToUpdate.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
