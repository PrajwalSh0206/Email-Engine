const { default: axios } = require("axios");
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

async function callbackService(req, res, logger) {
  logger.info(`Query: ${JSON.stringify(req.query)}`);
  const provider = req.params.provider;
  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    const { code, error, error_description } = req.query;
    if (error) {
    } else {
      const { clientId, tokenUrl, clientSecret, redirectUri } = providers[provider];

      const query = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      };
      logger.info(`Query | ${JSON.stringify(query)} | Url | ${tokenUrl}`);

      const response = await axios.post(tokenUrl, new URLSearchParams(query));
      logger.info(JSON.stringify(response.data));
      res.redirect("http://localhost:1234");
    }
  }
}

module.exports = { loginService, callbackService };
