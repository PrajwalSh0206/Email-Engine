const { providers } = require("../../config/providers");
const { MailHandler } = require("../../modules/MailHandler");
const { findWithLimit } = require("../../repositories/mailbox");
const { findUser, updateUser } = require("../../repositories/users");
const { convertArrayToObj } = require("../../utils/common");

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

      // Calculate the offset
      let limit = 10;
      const offset = index * limit;
      let attributes = ["folderName", "messageId", ["status", "flag"], "subject", "text", "from", ["mailDate", "date"], ["mailTime", "time"]];
      let condition = {
        userId,
      };

      const mailResponse = await findWithLimit(attributes, condition, offset, limit);
      if (!mailResponse.length) {
        imap.fetchInitialEmails(index, async (err, result) => {
          if (err) {
            return res.status(500).send(`Error While Fetching Data: ${err.message}`);
          }
          if (result?.messages) {
            const { messages, batch } = result;
            logger.info(`Email Fetched | Successfully | Length | ${Object.keys(result?.messages).length}`);
            await updateUser({ batch }, { id: userId });
            res.json({ messages, batch });
          }
        });
      } else {
        const userResponse = await findUser(["batch"], { id: userId });
        const { batch } = userResponse;
        const messages = convertArrayToObj(mailResponse, "messageId");
        res.json({ messages, batch });
      }
    } catch (error) {
      logger.error(`Error | ${JSON.stringify(error)}`);
      return res.status(500).send({ message: `Error connecting to IMAP: ${error.message}` });
    }
  }
}

module.exports = { fetchMailService };
