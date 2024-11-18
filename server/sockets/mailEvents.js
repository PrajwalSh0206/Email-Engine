const cookie = require("cookie"); // For manual parsing, if needed
const { providers } = require("../config/providers");
const { Logger } = require("../utils/logger");
const { MailHandler } = require("../modules/MailHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    const accessToken = cookie.parse(socket.handshake.headers.cookie)["access_token"];
    const { provider, email } = socket.handshake.auth; // Access the data sent by the client
    const logger = new Logger(`Socket Connected at ${provider}`);
    logger.info(`${JSON.stringify(provider)}`);

    let imap;
    if (providers[provider]) {
      logger.info("Provider Valid");
      imap = new MailHandler({ email, provider, accessToken }, socket, logger);
    }
    socket.on("disconnect", () => {
      logger.info("A user disconnected");
      if (imap) {
        imap.closeServer();
      }
    });
  });
};
