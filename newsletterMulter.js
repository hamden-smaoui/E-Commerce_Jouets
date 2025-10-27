const multer = require('multer');
const { storage } = require('./config/cloudinary'); // ✅ Utiliser Cloudinary storage

// File filter pour les images seulement
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, JPG, PNG, GIF, WEBP) sont autorisées'));
  }
};

// Configuration multer avec Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter,
});

module.exports = upload;