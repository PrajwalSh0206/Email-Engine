function fetchMailService(req, logger) {
  const { provider } = req.params;
  logger = logger.child("Service");
}

module.exports = { fetchMailService };
