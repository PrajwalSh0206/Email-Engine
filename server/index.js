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
const { FRONTEND_URL } = require("./constants");
const { authHandler } = require("./middleware/authentication");
const logger = new Logger("Main");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

// Socket Handling
mailEvents(io);

const NODE_PORT = process.env.NODE_PORT || 3000;
/* register middleware here */
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(ReqCtx);
app.use(authHandler);
app.use(router);

app.use(errorHandler);

const startServer = () => {
  (async function tryStart() {
    try {
      logger.info("Attempting to connect to the database...");
      await sequelize.authenticate();
      logger.info("Database connected.");

      await sequelize.sync(); // Sync models to the database
      logger.info("Database synchronized.");

      server.listen(NODE_PORT, () => {
        logger.info(`Server is running at: http://localhost:${NODE_PORT}`);
      });
    } catch (error) {
      logger.error(`Error occurred: ${JSON.stringify(error)}`);
      logger.info("Restarting the server in 5 seconds...");
      setTimeout(tryStart, 5000); // Retry after 5 seconds
    }
  })();
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit the process to allow Docker to restart
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1); // Exit the process to allow Docker to restart
});

startServer();
