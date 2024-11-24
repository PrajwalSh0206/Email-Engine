const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { providers } = require("../config/providers");
const sanitizeHtml = require("sanitize-html");
const { dateFormatter, timeFormatter } = require("../utils/common");
const { createIfNotExist, updateMail } = require("../repositories/mailbox");
const { decrypt } = require("../utils/enc-dec");

class MailHandler {
  #logger;
  #userId;
  #folderName;

  constructor({ email, accessToken, provider, userId, folderName }, io, logger) {
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
    this.#folderName = folderName || "INBOX";
    this.imap = new Imap(imapConfig);
  }

  #generateXOAuth2Token(userEmail, accessToken) {
    let decryptedToken = decrypt(accessToken);
    return Buffer.from(`user=${userEmail}\x01auth=Bearer ${decryptedToken}\x01\x01`).toString("base64");
  }

  #openBox(mailboxName, callback) {
    this.imap.openBox(mailboxName, true, callback);
  }

  monitorForNewEmails(callback) {
    this.imap.once("ready", () => {
      this.#openBox(this.#folderName, () => {
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
              const messageId = attrs.uid.toString();
              const condition = {
                messageId,
                userId: this.#userId,
              };
              await updateMail(data, condition);
              callback("updateEmail", {
                messageId,
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
        this.#openBox(this.#folderName, (err, box) => {
          let hasError = false;

          if (err) {
            hasError = true;
            this.#logger.error(`FolderName: ${this.#folderName} | Error : ${JSON.stringify(err)}`);
            this.imap.end();
            return callback(err, null);
          }
          const totalMessages = box.messages.total;
          let messages = {};

          if (totalMessages == 0) {
            hasError = true;
            this.imap.end();
            return callback(null, { messages, batch: 0 });
          }

          const parsePromises = []; // Array to store all parsing promises

          const batchSize = 10;
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
                  const { subject, text, from, date } = mail;

                  const messageId = attrs.uid.toString();

                  const sanitizedText = sanitizeHtml(text || "");

                  let flag = attrs.flags[0]?.replace(/\\/g, "").toUpperCase();
                  let message = {
                    from: from.value[0].address,
                    messageId,
                    subject,
                    flag: flag ? flag : "UNSEEN",
                    text: sanitizedText,
                    date: dateFormatter.format(date),
                    time: timeFormatter.format(date),
                  };

                  const condition = {
                    userId: this.#userId,
                    messageId,
                    folderName: this.#folderName,
                  };
                  createIfNotExist(
                    {
                      from: from.value[0].address,
                      subject,
                      status: flag ? flag : "UNSEEN",
                      text: sanitizedText,
                      mailDate: dateFormatter.format(date),
                      mailTime: timeFormatter.format(date),
                    },
                    condition
                  );
                  messages[messageId] = message;
                  resolveParser();
                });
              });
              parsePromises.push(parsePromise); // Add the promise to the list
            });
          });
          fetch.once("error", (fetchErr) => {
            this.imap.end();
            hasError = true;
            return callback(fetchErr, null);
          });
          fetch.once("end", () => {
            if (hasError) return;
            Promise.all(parsePromises)
              .then(() => {
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
