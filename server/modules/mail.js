const Imap = require("imap");
const { simpleParser } = require("mailparser");

const fetchEmails = async (imap, io, logger) => {
  logger = logger.child("Fetch Email");

  openBox(imap, (err, box) => {
    if (err) {
      imap.end();
      return io.emit("error", err);
    }

    const fetch = imap.seq.fetch(`1:${10}`, { struct: true, bodies: "" });

    fetch.on("message", (msg) => {
      let buffer = "";
      msg.on("body", (stream) => {
        stream.on("data", (chunk) => {
          buffer += chunk.toString("utf8");
        });
      });

      msg.once("attributes", (attrs) => {
        logger.info(`Flag: ${JSON.stringify(attrs.flags)}`);
        simpleParser(buffer, (err, mail) => {
          if (err) {
            logger.error(`Error ${err}`);
            imap.end();
            return io.emit("error", err);
          }
          const { subject, text, from, date, messageId } = mail;
          io.emit("mail", {
            from: from.value[0].address,
            messageId,
            subject,
            text,
            date,
          });
        });
      });

      // fetch.once("end", () => {
      //   imap.end();
      // });

      io.on("disconnect", () => {
        logger.info("A user disconnected");
        imap.end();
      });
    });
  });
};

function openBox(imap, callback) {
  imap.openBox("INBOX", true, callback);
}

function monitorForNewEmails(imap, io, logger) {
  imap.on("mail", (numNewMsgs) => {
    logger.info(`New mail arrived: ${numNewMsgs} message(s).`);
    fetchEmails(imap, io, logger); // Optionally, fetch the new emails
  });

  // Listen for message deletions
  imap.on("expunge", (seqno) => {
    console.log(`Message deleted. Sequence number: ${seqno}`);
  });

  imap.on("update", (seqno) => {
    console.log(`Message updated. Sequence number: ${seqno}`);

    // Fetch updated flags for this message
    const fetcher = imap.seq.fetch(seqno, { bodies: "", struct: true });
    fetcher.on("message", (msg) => {
      msg.on("attributes", (attrs) => {
        console.log("Updated flags:", attrs.flags);
      });
    });
  });
}

function initialize(imapConfig, io, logger) {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    logger.info("IMAP Ready");
    fetchEmails(imap, io, logger);
    monitorForNewEmails(imap, io, logger);
  });

  imap.once("error", (err) => {
    logger.error(`IMAP Error, ${err.message}`);
    io.emit("error", err);
  });

  imap.once("end", () => {
    logger.info("IMAP connection ended");
  });

  imap.connect();

  return imap;
}

module.exports = {
  fetchEmails,
  initialize,
};
