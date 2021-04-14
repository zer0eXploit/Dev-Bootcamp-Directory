const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title.'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description.'],
    },
    weeks: {
      type: String,
      required: [true, 'Please add number of weeks.'],
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost.'],
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill.'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: true,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: 'firstCreated', updatedAt: 'lastUpdated' } },
);

CourseSchema.statics.setAverageCost = async function (bootcampID) {
  // Calculate the average cost
  const avgCost = await this.aggregate([
    { $match: { bootcamp: bootcampID } },
    {
      $group: {
        _id: '$bootcamp',
        avgCost: {
          $avg: '$tuition',
        },
      },
    },
  ]);

  // Insert into db
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampID, {
      averageCost: Math.ceil(avgCost[0]['avgCost'] / 10) * 10,
    });
  } catch (e) {
    console.log(e);
  }
};

// Recalculate the average on each addition or removal of a courses
CourseSchema.pre('save', function (next) {
  // this.constructor is the Course Model itself
  // because 'this' is an instance of the Course model
  this.constructor.setAverageCost(this.bootcamp);
  next();
});

CourseSchema.pre('remove', function (next) {
  // this.constructor is the Course Model itself
  this.constructor.setAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
