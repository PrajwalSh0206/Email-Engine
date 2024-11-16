const { ReqValidator } = require("../../middleware/req-validator");
const { fetchMailController } = require("./mail.controller");
const { mailSchema } = require("./mail.schema");
const router = require("express").Router();

router.get("/:provider", ReqValidator(mailSchema), fetchMailController);

module.exports = { mailRouter: router };
