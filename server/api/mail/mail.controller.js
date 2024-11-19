const { fetchMailService } = require("./mail.service");

async function fetchMailController(req, res, next) {
  try {
    let { logger } = req.ctx;
    logger = logger.child("Controller");
    logger.info("Entered");
    await fetchMailService(req, res, logger);
  } catch (error) {
    next(error);
  }
}

module.exports = { fetchMailController };
