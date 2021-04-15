module.exports = (req, res, next) => {
  const url = req.url;
  res.status(404).json({
    message: `Resource ${url} is not found on this server.`,
  });
};
