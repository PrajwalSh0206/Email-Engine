const router = require("express").Router();
const { authRouter } = require("../api/auth/auth.routes");

router.use("/auth", authRouter);

module.exports = { router };
