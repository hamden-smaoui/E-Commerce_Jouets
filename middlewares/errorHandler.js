const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err); 

  let statusCode = 500;
  let message = "Une erreur est survenue";
  let code = "SERVER_ERROR";

  switch (err.code) {
    case "AUTH_ERROR":
      statusCode = 401;
      message = err.message || "Identifiants invalides ou accès refusé";
      code = "AUTH_ERROR";
      break;
    case "RATE_LIMIT":
      statusCode = 429;
      message = err.message || "Trop de tentatives, veuillez réessayer plus tard.";
      code = "RATE_LIMIT";
      break;
    case "VALIDATION_ERROR":
      statusCode = 400;
      message = err.message || "Données invalides";
      code = "VALIDATION_ERROR";
      break;
    case "NOT_FOUND":
      statusCode = 404;
      message = err.message || "Ressource non trouvée";
      code = "NOT_FOUND";
      break;
    default:
      // On garde le message générique
      break;
  }

  res.status(statusCode).json({ message, code });
}

module.exports = errorHandler;