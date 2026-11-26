const winston = require("winston");
const { combine, timestamp, printf, colorize } = winston.format;
const { isObject } = require("./common");

const winstonLogger = winston.createLogger({
  level: "debug",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    printf((info) => `[${info.timestamp}] ${info.level} | ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

/**
 *
 */
class Logger {
  /**
   *
   * @param {string} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   *
   * @param {string} context
   */
  updateContext(context) {
    this.context = [this.context, context].join(" | ");
  }

  /**
   *
   * @param {string} msg
   * @return {string}
   */
  formatLog(msg) {
    return [this.context, isObject(msg) ? JSON.stringify(msg) : msg].join(" | ");
  }

  /**
   *
   * @param {string} context
   * @return {string}
   */
  child(context) {
    const logger = new Logger(this.context);
    logger.updateContext(context);

    return logger;
  }

  /**
   *
   * @param {string} msg
   */
  info(msg) {
    winstonLogger.info(this.formatLog(msg));
  }

  /**
   *
   * @param {string} msg
   */
  error(msg) {
    winstonLogger.error(this.formatLog(msg));
  }

  /**
   *
   * @param {string} msg
   */
  debug(msg) {
    winstonLogger.debug(this.formatLog(msg));
  }
}

module.exports = {
  Logger,
};
