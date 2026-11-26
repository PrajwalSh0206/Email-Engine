const router = require("express").Router();
const { authRouter } = require("../api/auth/auth.routes");
const { mailRouter } = require("../api/mail/mail.routes");

router.use("/auth", authRouter);
router.use("/mail", mailRouter);

module.exports = { router };
