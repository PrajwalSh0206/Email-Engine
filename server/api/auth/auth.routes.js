const { loginController, callbackController } = require("./auth.controller");

const router = require("express").Router();

router.get("/login/:provider", loginController);
router.get("/callback/:provider", callbackController);

module.exports = { authRouter: router };
