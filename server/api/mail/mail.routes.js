const { ReqValidator } = require("../../middleware/req-validator");
const { fetchMailController } = require("./mail.controller");
const { mailBodySchema, mailParamSchema } = require("./mail.schema");
const router = require("express").Router();

router.post("/:provider", ReqValidator(mailParamSchema, mailBodySchema), fetchMailController);

module.exports = { mailRouter: router };
