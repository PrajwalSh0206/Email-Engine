const CONSTANTS = {
  RATE_LIMITER_CONSTANTS: {
    RATE_LIMIT: 60,
    TIMEFRAME: 60 * 1000, // 1 minute in milliseconds
  },
  FRONTEND_URL: "http://localhost:3000",
  COOKIE_CONSTANTS: {
    MAX_AGE: 3600000, // Token expiration (1 hour)
  },
};

module.exports = CONSTANTS;
