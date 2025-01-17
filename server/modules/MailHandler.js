const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { providers } = require("../config/providers");
const sanitizeHtml = require("sanitize-html");
const { dateFormatter, timeFormatter } = require("../utils/common");
const { updateMail, createOrUpdateMail, findMail } = require("../repositories/mailbox");
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
    this.#folderName = folderName?.toUpperCase() || "INBOX";
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
      this.#openBox(this.#folderName, async (err, box) => {
        if (err) {
          this.#logger.error(`FolderName: ${this.#folderName} | Error : ${JSON.stringify(err)}`);
          this.imap.end();
          return callback(err, null);
        }

        // Sync Mail Starts
        const totalMessages = box.messages.total;
        if (totalMessages !== 0) {
          const batchSize = 10;
          const batch = Math.ceil(totalMessages / batchSize);

          for (let i = 1; i < batch; i++) {
            await new Promise((resolve, reject) => {
              this.fetchBatchEmail(
                totalMessages,
                i,
                (err, result) => {
                  if (err) {
                    this.#logger.error(`Error: ${err}`);
                    resolve();
                  } else {
                    this.#logger.info(`Batch ${i + 1} Completed`);
                    resolve();
                  }
                },
                false
              );
            });
          }
        }
        // Sync Mail Ends

        // Listen For New Email
        this.imap.on("mail", (numNewMsgs) => {
          this.#logger.info(`New mail arrived: ${numNewMsgs} message(s).`);
          this.fetchNewEmails(callback);
        });

        // Listen for message deletions
        this.imap.on("expunge", (seqno) => {
          this.#logger.info(`Message deleted. Sequence number: ${seqno}`);
          updateMail(
            {
              folderName: "DELETED",
            },
            {
              messageId: seqno,
              userId: this.#userId,
            }
          );
        });

        // Listen for Update
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

  messageParser(msg, messages, parsePromises) {
    let buffer = "";
    msg.on("body", (stream) => {
      stream.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
      });
    });

    msg.once("attributes", (attrs) => {
      this.#logger.info(`Flag: ${JSON.stringify(attrs.flags)}`);
      const parsePromise = new Promise((resolveParser, rejectParser) => {
        simpleParser(buffer, async (err, mail) => {
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
            folderName: this.#folderName,
            text: sanitizedText,
            date: dateFormatter.format(date),
            time: timeFormatter.format(date),
          };

          const condition = {
            userId: this.#userId,
            messageId,
            folderName: this.#folderName,
          };
          await createOrUpdateMail(
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
  }

  async fetchNewEmails(callback) {
    const mail = await findMail(
      ["messageId"],
      {
        userId: this.#userId,
        folderName: this.#folderName,
      },
      [["messageId", "DESC"]]
    );
    const searchCriteria = [["UID", `${mail.messageId + 1}:*`]]; // Fetch emails with UID > lastUid
    const fetchOptions = {
      bodies: ["HEADER", "TEXT"],
      struct: true,
    };

    return new Promise((resolve, reject) => {
      this.imap.search(searchCriteria, (err, results) => {
        if (err) return reject(err);

        if (results.length === 0) return resolve([]); // No new emails

        const fetch = this.imap.fetch(results, fetchOptions);
        let messages = {};
        let parsePromises = [];
        fetch.on("message", (msg) => {
          this.messageParser(msg, messages, parsePromises);
        });

        fetch.on("end", () => {
          Promise.all(parsePromises)
            .then(() => {
              this.#logger.info(`${JSON.stringify(messages)}`);
              callback("newEmail", { messages });
            })
            .catch((parseErr) => {
              this.#logger.error(`Error : ${JSON.stringify(parseErr)}`);
              callback(parseErr, null);
            });
        });
        fetch.on("error", (err) => reject(err));
      });
    });
  }

  async fetchBatchEmail(totalMessages, batchIndex, callback, endImap = true) {
    const parsePromises = []; // Array to store all parsing promises
    let messages = {};
    const batchSize = 10;
    const batch = Math.ceil(totalMessages / batchSize);
    const start = batchIndex * batchSize + 1;
    const end = Math.min((batchIndex + 1) * batchSize, totalMessages);

    const fetch = this.imap.seq.fetch(`${start}:${end}`, { bodies: "" });
    let hasError = false;

    fetch.on("message", (msg) => {
      this.messageParser(msg, messages, parsePromises);
    });
    fetch.once("error", (fetchErr) => {
      endImap && this.imap.end();
      hasError = true;
      return callback(fetchErr, null);
    });
    fetch.once("end", () => {
      if (hasError) return;
      Promise.all(parsePromises)
        .then(() => {
          callback(null, { messages, totalMessages, batch });
        })
        .catch((parseErr) => {
          this.imap.end();
          callback(parseErr, null);
        });
    });
  }

  async fetchInitialEmails(batchIndex, callback) {
    return new Promise(() => {
      this.imap.once("ready", () => {
        this.#openBox(this.#folderName, (err, box) => {
          if (err) {
            hasError = true;
            this.#logger.error(`FolderName: ${this.#folderName} | Error : ${JSON.stringify(err)}`);
            this.imap.end();
            return callback(err, null);
          }
          const totalMessages = box.messages.total;
          if (totalMessages == 0) {
            this.imap.end();
            return callback(null, { messages: {}, totalMessages, batch: 0 });
          } else {
            this.fetchBatchEmail(totalMessages, batchIndex, callback);
          }
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
