class CustomError extends Error {
  error = {};
  status = 500;
  constructor(status, message = "", error = {}) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    this.error = error;
    this.status = status;
  }
}

module.exports = { CustomError };
