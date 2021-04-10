const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Please add a name.'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email.'],
      unique: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        'Please add a valid email.',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: { createdAt: 'firstCreated', updatedAt: 'lastUpdated' },
  },
);

module.exports = mongoose.model('User', UserSchema);
