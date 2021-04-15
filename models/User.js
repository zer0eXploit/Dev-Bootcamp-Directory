const crypto = require('crypto');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

UserSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // store the hashed version
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // return the original version for the client to use
  return resetToken;
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Cascade delete bootcamp associated with a user
UserSchema.pre('remove', async function (next) {
  // Get the bootcamps by the user.
  // Either import the Bootcamp model or access it via this.model
  const bootcamps = await this.model('Bootcamp')
    .find({
      user: this._id,
    })
    .select('_id');

  // Delete all bootcamps by that user
  for (bootcamp of bootcamps) {
    const b = await this.model('Bootcamp').findById(bootcamp.id);
    b.remove();
  }

  next();
});

module.exports = mongoose.model('User', UserSchema);
