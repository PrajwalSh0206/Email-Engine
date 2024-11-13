const { loginService } = require("./auth.service");

function loginController(req, res, next) {
  try {
    return loginService(req);
  } catch (error) {
    next(error);
  }
}

module.exports = { loginController };
