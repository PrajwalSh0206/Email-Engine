const { loginService, callbackService } = require("./auth.service");

function loginController(req, res, next) {
  try {
    const url = loginService(req, res);
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
