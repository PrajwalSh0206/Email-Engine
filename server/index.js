require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");

const { Logger } = require("./utils/logger");
const { router } = require("./routes");
const { ReqCtx } = require("./middleware/ctx-logger");
const { errorHandler } = require("./middleware/error-handler");
const mailEvents = require("./sockets/mailEvents");
const { sequelize } = require("./models");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:1234",
    credentials: true,
  },
});

// Socket Handling
mailEvents(io);

const NODE_PORT = process.env.NODE_PORT || 3000;
/* register middleware here */
app.use(cors({ origin: "http://localhost:1234", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(ReqCtx);
app.use(router);
app.use(errorHandler);

(async () => {
  const logger = new Logger("Main");
  try {
    await sequelize.authenticate();
    logger.info("Database connected");
    await sequelize.sync(); // `force: true` drops the table if it exists
    logger.info("Database synchronized.");
    server.listen(NODE_PORT, () => {
      logger.info(`Server is Running at: http://localhost:${NODE_PORT}`);
    });
  } catch (error) {
    logger.error(`Error : ${JSON.stringify(error)}`);
  }
})();
