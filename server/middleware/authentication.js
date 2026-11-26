const authHandler = (req, res, next) => {
  let { logger } = req.ctx;
  const protectedPatterns = [/^\/mail\/[^/]+$/];
  const isProtected = protectedPatterns.some((pattern) => (typeof pattern === "string" ? req.path === pattern : pattern.test(req.path)));
  logger = logger.child("Authentication");
  if (isProtected) {
    logger.info("Entered");
    const authCookie = req.cookies["access_token"];

    if (!authCookie) {
      logger.error("No Auth Found");
      return res.status(401).json({ message: "Unauthorized: No authentication cookie found" });
    }
  }
  logger.info("Valid");
  next();
};

module.exports = { authHandler };
