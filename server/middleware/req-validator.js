const sendValidationError = process.env.SEND_VALIDATION_ERROR === 'TRUE';

const ReqValidator = (...schemas) => {
  return (req, res, next) => {
    for (const { schema, source } of schemas) {
      const { error } = schema.validate(req[source]);
      if (error) {
        return res.status(400).json({
          message: sendValidationError ? error.message : 'Bad Request',
        });
      }
    }
    next();
  };
};

module.exports = {
  ReqValidator,
};
