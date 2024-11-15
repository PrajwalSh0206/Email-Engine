const Joi = require("joi");
const { providersKeys } = require("../../config/providers");

const signInSchema = {
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

module.exports = {
  signInSchema,
};
