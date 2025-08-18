const jwt = require('jsonwebtoken');

const authenticateTenant = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token requis' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (!decoded.tenantId) {
      return res.status(401).json({ message: 'tenantId manquant dans le token' });
    }
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide', error: error.message });
  }
};

module.exports = { authenticateTenant };