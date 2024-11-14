const { providers } = require("../../config/providers");
const { STATUS_CODE } = require("../../constants/http-status");
const { CustomError } = require("../../utils/CustomError");

function loginService(req, logger) {
  const { provider } = req.params;
  logger = logger.child("Service");

  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    const { authUrl, clientId, redirectUri, scope } = providers[provider];
    const url = `${authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
    logger.info(`Redirect Url Created`);
    return url;
  }
}

async function callbackService(req) {
  const provider = req.params.provider;
  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    const code = req.query.code;

    const response = await axios.post(
      providers[provider].tokenUrl,
      new URLSearchParams({
        client_id: providers[provider].clientId,
        client_secret: providers[provider].clientSecret,
        code,
        redirect_uri: providers[provider].redirectUri,
        grant_type: "authorization_code",
      })
    );

    req.session[`${provider}_access_token`] = response.data.access_token;
  }
}

module.exports = { loginService, callbackService };
