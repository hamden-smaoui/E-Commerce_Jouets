const rateLimit = require('express-rate-limit');

// Apply stricter limits to login, register, password reset
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // Limit each IP to 5 requests per windowMs
  message: {
    message: "Trop de tentatives, veuillez réessayer dans quelques minutes.",
    code: "RATE_LIMIT"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { sensitiveLimiter };