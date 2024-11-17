const { providers } = require("../../config/providers");
const { STATUS_CODE } = require("../../constants/http-status");
const { simpleParser } = require("mailparser");
const { CustomError } = require("../../utils/CustomError");
const Imap = require("imap"),
  inspect = require("util").inspect;

// const fetchEmails = async (connection) => {
//   const searchCriteria = ["UNSEEN"];
//   const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };
//   const results = await connection.search(searchCriteria, fetchOptions);
//   const messages = results.map(async (res) => {
//     const parts = res.parts.map((part) => part.body).join("");
//     return simpleParser(parts);
//   });
//   return Promise.all(messages);
// };

// Function to generate XOAUTH2 token
const generateXOAuth2Token = (accessToken) => {
  return Buffer.from(`user=\x01auth=Bearer ${accessToken}\x01\x01`).toString("base64");
};

async function fetchMailService(req, res, logger) {
  const { provider } = req.params;
  logger = logger.child("Service");
  logger.info("Entered");
  logger.info(`${req.headers.authorization}`);
  let token = req.headers.authorization?.split(" ");
  let accessToken = token[1];
  accessToken = accessToken;

  if (!providers[provider]) {
    throw new CustomError("Invalid provider", STATUS_CODE.NOT_FOUND);
  } else {
    var config = {
      host: providers[provider].imapHost,
      port: 993,
      tls: true,
      xoauth2: generateXOAuth2Token(accessToken),
      tlsOptions: { rejectUnauthorized: false },
    };
    try {
      const messages = await fetchEmails(config);
      res.json(messages);
    } catch (error) {
      logger.error(`Error | ${JSON.stringify(error)}`);
      return res.status(500).send(`Error connecting to IMAP: ${error.message}`);
    }
  }
}

// Function to fetch unseen emails
const fetchEmails = async (imapConfig) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        imap.search(["UNSEEN"], (err, results) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          const fetch = imap.fetch(results, { bodies: "" });

          const messages = [];
          fetch.on("message", (msg) => {
            let buffer = "";
            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
            });

            msg.once("attributes", (attrs) => {
              simpleParser(buffer, (err, mail) => {
                if (err) {
                  imap.end();
                  return reject(err);
                }
                messages.push({
                  subject: mail.subject,
                  from: mail.from.text,
                  date: mail.date,
                  text: mail.text,
                });
              });
            });
          });

          fetch.once("end", () => {
            imap.end();
            resolve(messages);
          });
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.once("end", () => {
      console.log("Connection ended");
    });

    imap.connect();
  });
};

module.exports = { fetchMailService };
