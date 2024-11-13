const providers = {
  outlook: {
    clientId: process.env.OUTLOOK_CLIENTID,
    clientSecret: process.env.OUTLOOK_CLIENTSECRET,
    redirectUri: process.env.OUTLOOK_REDIRECTURI,
    authUrl: process.env.OUTLOOK_AUTHURL,
    tokenUrl: process.env.OUTLOOK_TOKENURL,
    scope: process.env.OUTLOOK_SCOPE,
    imapHost: process.env.OUTLOOK_IMAPHOST,
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENTID,
    clientSecret: process.env.GMAIL_CLIENTSECRET,
    redirectUri: process.env.GMAIL_REDIRECTURI,
    authUrl: process.env.GMAIL_AUTHURL,
    tokenUrl: process.env.GMAIL_TOKENURL,
    scope: process.env.GMAIL_SCOPE,
    imapHost: process.env.GMAIL_IMAPHOST,
  },
};

module.exports = { providers };
