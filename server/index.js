require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { Logger } = require("./utils/logger");
const { router } = require("./routes");
const { ReqCtx } = require("./middleware/ctx-logger");
const { errorHandler } = require("./middleware/error-handler");
const session = require("express-session");

const app = express();

const NODE_PORT = process.env.NODE_PORT || 3000;

/* register middleware here */
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());

app.use(
  session({
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true,
  })
);

app.use(ReqCtx);
app.use(router);
app.use(errorHandler);

// app.use(ErrorHandler); // should be registered last

app.listen(NODE_PORT, () => {
  new Logger("main").info(`Server is Running at: http://localhost:${NODE_PORT}`);
});
