const { fetchMailService } = require("./mail.service");

function fetchMailController(req, res, next) {
  try {
    let { logger } = req.ctx;
    logger = logger.child("Controller");
    logger.info("Entered");
    const url = fetchMailService(req, res, logger);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchMailController };
