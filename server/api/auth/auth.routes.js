const { ReqValidator } = require("../../middleware/req-validator");
const { loginController, callbackController } = require("./auth.controller");
const { signInSchema } = require("./auth.schema");

const router = require("express").Router();

router.get("/login/:provider", ReqValidator(signInSchema), loginController);
router.get("/callback/:provider", callbackController);

module.exports = { authRouter: router };
