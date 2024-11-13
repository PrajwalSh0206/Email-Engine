const { providers } = require("../../config/providers");
const { STATUS_CODE } = require("../../constants/http-status");
const { CustomError } = require("../../utils/CustomError");

function loginService(req) {
  const { provider } = req.params;
  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    const { authUrl, clientId, redirectUri, scope } = providers[provider];
    const url = `${authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
    res.redirect(url);
  }
}

module.exports = { loginService };
