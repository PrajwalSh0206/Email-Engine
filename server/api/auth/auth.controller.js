const { loginService, callbackService } = require("./auth.service");

function loginController(req, res, next) {
  try {
    let { logger } = req.ctx;
    logger = logger.child("Controller");
    logger.info("Entered");
    const url = loginService(req, logger);
    return res.send({ url });
  } catch (error) {
    next(error);
  }
}

function callbackController(req, res, next) {
  try {
    return callbackService(req);
  } catch (error) {
    next(error);
  }
}

module.exports = { loginController, callbackController };
