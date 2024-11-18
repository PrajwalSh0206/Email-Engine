const { providers } = require("../../config/providers");
const { MailHandler } = require("../../modules/MailHandler");

async function fetchMailService(req, res, logger) {
  const { provider } = req.params;
  const { email, index, userId } = req.body;
  logger = logger.child("Service");
  logger.info("Entered");

  const accessToken = req.cookies.access_token;

  if (!providers[provider]) {
    return res.status(400).send({ message: `Invalid Providers` });
  } else {
    try {
      let imap = new MailHandler({ email, provider, accessToken, userId }, null, logger);
      imap.fetchInitialEmails(index, (err, result) => {
        if (err) {
          return res.status(500).send(`Error While Fetching Data: ${err.message}`);
        }
        if (result?.messages) {
          const { messages, batch } = result;
          logger.info(`Email Fetched | Successfully | Length | ${Object.keys(result?.messages).length}`);
          res.json({ messages, batch });
        }
      });
    } catch (error) {
      logger.error(`Error | ${JSON.stringify(error)}`);
      return res.status(500).send({ message: `Error connecting to IMAP: ${error.message}` });
    }
  }
}

module.exports = { fetchMailService };
