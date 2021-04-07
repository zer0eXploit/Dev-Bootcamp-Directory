// @desc    Wraps an async function, catches the error if any and then forwards it.
const asyncHandler = (fn) => (req, res, next) => {
  // can use catch becuse fn is an async function
  //   thus there will be promise rejection in case there's an error
  fn(req, res, next).catch(next);
};

module.exports = asyncHandler;
