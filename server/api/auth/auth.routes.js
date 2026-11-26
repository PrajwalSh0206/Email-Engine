const { ReqValidator } = require("../../middleware/req-validator");
const { loginController, callbackController } = require("./auth.controller");
const { signInSchema, callBackSchema } = require("./auth.schema");

const router = require("express").Router();

router.get("/login/:provider", ReqValidator(signInSchema), loginController);
router.get("/callback/:provider", ReqValidator(callBackSchema), callbackController);

module.exports = { authRouter: router };
