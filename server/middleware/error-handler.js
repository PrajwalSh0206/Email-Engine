const { formatErr } = require("../utils/common");

/**
 *
 * @param {Error} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Object}
 */
const errorHandler = (err, req, res, next) => {
  if (!err?.httpStatusCode) {
    req.ctx.logger.error(`ErrorHandler | unhandled exception | ${formatErr(err)}`);

    return res.status(500).json({ message: "Something went wrong!" });
  }

  res.status(err?.httpStatusCode).json({ message: err.message });
};

module.exports = {
  errorHandler,
};
