const crypto = require("crypto");
const { Logger } = require("../utils/logger");

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const ReqCtx = (req, res, next) => {
  const requestId = crypto.randomUUID();
  const routeKey = `${req.method} ${req.path}`;
  const logger = new Logger(`${routeKey} | ${requestId}`);

  const ctx = {
    requestId: requestId,
    logger: logger,
    routeKey: routeKey,
  };
  req.ctx = ctx;

  next();
};

module.exports = {
  ReqCtx,
};