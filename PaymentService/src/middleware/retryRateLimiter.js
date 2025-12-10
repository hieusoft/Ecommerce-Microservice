const rateLimit = require("express-rate-limit");

const retryRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  message: {
    error: "Too many retry attempts. Please try again after 1 hour.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = retryRateLimiter;
