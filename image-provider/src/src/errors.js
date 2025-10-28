class NotFoundError extends Error {
    constructor(message, details = {}) {
      super(message);
      this.name = 'NotFoundError';
      this.details = details;
    }
  }
  
  class ValidationError extends Error {
    constructor(message, details = {}) {
      super(message);
      this.name = 'ValidationError';
      this.details = details;
    }
  }
  
  module.exports = { NotFoundError, ValidationError };
  ``