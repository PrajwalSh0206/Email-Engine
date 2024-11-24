const { providers } = require("../../config/providers");
const { STATUS_CODE } = require("../../constants/http-status");
const { MailHandler } = require("../../modules/MailHandler");
const { findWithLimit } = require("../../repositories/mailbox");
const { findUser, updateUser } = require("../../repositories/users");
const { convertArrayToObj } = require("../../utils/common");

async function fetchMailService(req, res, logger) {
  const { provider } = req.params;
  const { email, index, userId, folderName } = req.body;
  logger = logger.child("Service");
  logger.info("Entered");

  const accessToken = req.cookies.access_token;

  if (!providers[provider]) {
    return res.status(400).send({ message: `Invalid Providers` });
  } else {
    try {
      // Calculate the offset
      let limit = 10;
      const offset = index * limit;
      let attributes = ["folderName", "messageId", ["status", "flag"], "subject", "text", "from", ["mailDate", "date"], ["mailTime", "time"]];
      let condition = {
        userId,
        folderName,
      };

      const mailResponse = await findWithLimit(attributes, condition, offset, limit);
      if (index == 0 || !mailResponse || !mailResponse?.length || mailResponse?.length != 10) {
        let imap = new MailHandler({ email, provider, accessToken, userId, folderName }, null, logger);
        imap.fetchInitialEmails(index, async (err, result) => {
          if (err) {
            logger.error(`Error While Fetching Data: ${err.message}`);
            return res.status(500).json({ message: `Error While Fetching Data: ${err.message}` });
          } else if (result?.messages && Object.keys(result.messages).length >= 1) {
            const { messages, batch } = result;
            logger.info(`Email Fetched | Successfully | Length | ${Object.keys(result?.messages).length}`);
            await updateUser({ batch }, { id: userId });
            return res.json({ messages, batch });
          } else {
            logger.info(`Email Fetched | Successfully | Length | ${Object.keys(result?.messages).length}`);
            return res.status(STATUS_CODE.NO_CONTENT).json({ messages: {}, batch: 0 });
          }
        });
      } else {
        const userResponse = await findUser(["batch"], { id: userId });
        const { batch } = userResponse;
        const messages = convertArrayToObj(mailResponse, "messageId");
        return res.json({ messages, batch });
      }
    } catch (error) {
      logger.error(`Error | ${JSON.stringify(error)}`);
      return res.status(500).send({ message: `Error connecting to IMAP: ${error.message}` });
    }
  }
}

module.exports = { fetchMailService };
