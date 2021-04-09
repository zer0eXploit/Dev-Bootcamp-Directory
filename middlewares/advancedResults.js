const advancedResults = (Model, fieldToPopulate) => async (req, res, next) => {
  const reqQuery = { ...req.query };
  const queryParams = ['select', 'sortBy', 'page', 'limit'];

  queryParams.map((field) => delete reqQuery[field]);

  let queryStr = JSON.stringify(reqQuery);

  // \b is word boundary
  // any word that is not inside \w is a word boundary
  // for example in 'hello-world' dash is a word boundary
  // because gt, lt, etc., are surrounded by quotes: "gt" like so,
  // they fall between word boundaries which are the double quotes

  const regex = /\b(gt|lt|lte|gte|in)\b/g;
  queryStr = queryStr.replace(regex, (match) => `$${match}`);

  const query = Model.find(JSON.parse(queryStr));

  // if select is present in query string strips the values
  if (req.query.select) {
    query.select(req.query.select.split(',').join(' '));
  }

  if (req.query.sortBy) {
    query.sort(req.query.sortBy.split(',').join(' '));
  } else {
    query.sort('-firstCreated');
  }

  // Field Population
  query.populate(fieldToPopulate);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;
  const total = await Model.countDocuments();

  query.skip(startIdx).limit(limit);

  const result = await query;

  // Pagination Object
  const pagination = {};
  if (endIdx < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIdx > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    length: result.length,
    paginationInfo: pagination,
    data: result,
  };

  next();
};

module.exports = advancedResults;
