const { default: axios } = require("axios");
const { providers } = require("../../config/providers");
const { STATUS_CODE } = require("../../constants/http-status");
const { CustomError } = require("../../utils/CustomError");
const { FRONTEND_URL, COOKIE_CONSTANTS } = require("../../constants");
const jwt = require("jsonwebtoken");
const { createIfNotExist } = require("../../repositories/users");
const { encrypt } = require("../../utils/enc-dec");

function loginService(req, logger) {
  const { provider } = req.params;
  logger = logger.child("Service");
  logger.info("Entered");

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
  const { provider } = req.params;
  logger = logger.child("Service");
  logger.info("Entered");
  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    const { code, error, error_description } = req.query;
    if (error) {
      logger.error(`Error | ${error} | Error | ${error_description}`);
      res.redirect(`${FRONTEND_URL}/error?error=${error}`);
    } else {
      const { clientId, tokenUrl, clientSecret, redirectUri } = providers[provider];

      const query = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      };

      try {
        const response = await axios.post(tokenUrl, new URLSearchParams(query), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        logger.info(`Access Token | Created`);

        const access_token = response.data.access_token;
        const id_token = response.data.id_token;
        const idTokenPayload = jwt.decode(id_token);
        const email = idTokenPayload.email;

        const data = {
          email,
          provider,
        };
        const condition = {
          email,
        };
        // Store User Details
        const result = await createIfNotExist(data, condition);

        res.cookie("access_token", encrypt(access_token), {
          httpOnly: true,
          secure: true,
          maxAge: COOKIE_CONSTANTS.MAX_AGE,
          sameSite: "Strict",
        });

        res.redirect(`${FRONTEND_URL}/mail/${provider}/inbox?email=${email}&user_id=${result.id}`);
      } catch (error) {
        logger.error(`Error | ${JSON.stringify(error)}`);
        res.redirect(`${FRONTEND_URL}/error?error=Something_Went_Wrong`);
      }
    }
  }
}

module.exports = { loginService, callbackService };
