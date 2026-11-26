const Joi = require("joi");
const { providersKeys } = require("../../config/providers");

const mailParamSchema = {
  source: "params",
  schema: Joi.object({
    provider: Joi.string().custom((value, helpers) => {
      if (providersKeys.includes(value)) {
        return value;
      }
      return helpers.message("Invalid provider");
    }, "Custom Validation"),
  }),
};

const mailBodySchema = {
  source: "body",
  schema: Joi.object({
    email: Joi.string().required().email(),
    index: Joi.number().required(),
    userId: Joi.string().required(),
    folderName: Joi.string().required(),
  }),
};
module.exports = {
  mailParamSchema,
  mailBodySchema,
};
