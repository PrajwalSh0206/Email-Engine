const Joi = require("joi");

const signInSchema = {
  source: "params",
  schema: Joi.object({
    provider: Joi.string().custom((value, helpers) => {
      if (["outlook", "gmail"].includes(value)) {
        return value;
      }
      return helpers.message("Invalid provider provided");
    }, "Custom Validation"),
  }),
};

module.exports = {
  signInSchema,
};
