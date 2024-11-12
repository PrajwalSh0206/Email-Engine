require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
/**
 *
 */
const app = express();
const logger = new Logger("main");
const NODE_PORT = process.env.NODE_PORT;

/* register middleware here */
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());

app.use(ErrorHandler); // should be registered last

app.listen(NODE_PORT, () => {
  logger.info(`Server is Running at: http://localhost:${NODE_PORT}`);
});
