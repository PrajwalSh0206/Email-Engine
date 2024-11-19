const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { providers } = require("../config/providers");
const sanitizeHtml = require("sanitize-html");
const { dateFormatter, timeFormatter } = require("../utils/common");
const { createIfNotExist, updateMail } = require("../repositories/mailbox");

class MailHandler {
  #logger;
  #userId;

  constructor({ email, accessToken, provider, userId }, io, logger) {
    this.#logger = logger.child("Fetch Email");
    const imapConfig = {
      host: providers[provider].imapHost,
      port: 993,
      user: email,
      tls: true,
      xoauth2: this.#generateXOAuth2Token(email, accessToken), // Generate XOAUTH2 token
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 10000, // Connection timeout (10 seconds)
      authTimeout: 10000, // Authentication timeout (10 seconds)
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true,
      },
    };
    this.#userId = userId;
    this.imap = new Imap(imapConfig);
  }

  #generateXOAuth2Token(userEmail, accessToken) {
    return Buffer.from(`user=${userEmail}\x01auth=Bearer ${accessToken}\x01\x01`).toString("base64");
  }

  #openBox(mailboxName, callback) {
    this.imap.openBox(mailboxName, true, callback);
  }

  monitorForNewEmails(callback) {
    this.imap.once("ready", () => {
      this.#openBox("INBOX", () => {
        this.imap.on("mail", (numNewMsgs) => {
          this.#logger.info(`New mail arrived: ${numNewMsgs} message(s).`);
        });

        // Listen for message deletions
        this.imap.on("expunge", (seqno) => {
          this.#logger.info(`Message deleted. Sequence number: ${seqno}`);
        });

        this.imap.on("update", (seqno) => {
          this.#logger.info(`Message updated. Sequence number: ${seqno}`);

          // Fetch updated flags for this message
          const fetcher = this.imap.seq.fetch(seqno, { bodies: "" });
          fetcher.on("message", (msg) => {
            msg.on("attributes", async (attrs) => {
              this.#logger.info(`Updated flags: ${attrs.flags} ${attrs.uid}`);
              let flag = attrs.flags[0]?.replace(/\\/g, "").toUpperCase();
              const data = {
                status: flag ? flag : "UNSEEN",
              };
              const condition = {
                messageId: attrs.uid,
                userId: this.#userId,
              };
              await updateMail(data, condition);
              callback("updateEmail", {
                messageId: attrs.uid,
                flag: data.status,
              });
            });
          });
        });
      });
    });
    this.imap.connect();
  }

  async fetchInitialEmails(batchIndex, callback) {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        this.#openBox("INBOX", (err, box) => {
          if (err) {
            this.imap.end();
            return this.handleResponse(err, null, { resolve, reject });
          }
          const parsePromises = []; // Array to store all parsing promises

          let messages = {};
          const batchSize = 10;
          const totalMessages = box.messages.total;
          const batch = Math.ceil(totalMessages / batchSize);
          const start = batchIndex * batchSize + 1;
          const end = Math.min((batchIndex + 1) * batchSize, totalMessages);

          const fetch = this.imap.seq.fetch(`${start}:${end}`, { bodies: "" });

          fetch.on("message", (msg) => {
            let buffer = "";
            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
            });

            msg.once("attributes", (attrs) => {
              this.#logger.info(`Flag: ${JSON.stringify(attrs.flags)}`);
              const parsePromise = new Promise((resolveParser, rejectParser) => {
                simpleParser(buffer, (err, mail) => {
                  if (err) {
                    logger.error(`Error ${err}`);
                    return rejectParser(err);
                  }
                  const { subject, text, from, date, messageId } = mail;

                  const sanitizedText = sanitizeHtml(text || "");

                  let flag = attrs.flags[0]?.replace(/\\/g, "").toUpperCase();
                  let message = {
                    from: from.value[0].address,
                    messageId: attrs.uid,
                    subject,
                    flag: flag ? flag : "UNSEEN",
                    text: sanitizedText,
                    date: dateFormatter.format(date),
                    time: timeFormatter.format(date),
                  };

                  const condition = {
                    userId: this.#userId,
                    messageId,
                  };
                  createIfNotExist(
                    {
                      userId: this.#userId,
                      from: from.value[0].address,
                      messageId: attrs.uid,
                      subject,
                      status: flag ? flag : "UNSEEN",
                      text: sanitizedText,
                      mailDate: dateFormatter.format(date),
                      mailTime: timeFormatter.format(date),
                    },
                    condition
                  );
                  messages[message.messageId] = message;
                  resolveParser();
                });
              });
              parsePromises.push(parsePromise); // Add the promise to the list
            });
          });
          fetch.once("error", (fetchErr) => callback(fetchErr, null));
          fetch.once("end", () => {
            Promise.all(parsePromises)
              .then(() => {
                this.imap.end();
                callback(null, { messages, batch });
              })
              .catch((parseErr) => {
                this.imap.end();
                callback(parseErr, null);
              });
          });
        });
      });
      this.imap.connect();
    });
  }

  closeServer() {
    this.#logger.info("IMAP Server Closed");
    this.imap.end();
  }
}

module.exports = { MailHandler };
