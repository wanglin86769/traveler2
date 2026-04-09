const multer = require('multer');
const { getUploadDir, generateFilename } = require('../utils/storage');

// Traveler data file upload configuration
const travelerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = getUploadDir();
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

const travelerUpload = multer({
  storage: travelerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  }
});

// Discrepancy log file upload configuration
const discrepancyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = getUploadDir();
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

const discrepancyUpload = multer({
  storage: discrepancyStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  }
});

module.exports = {
  travelerUpload,
  discrepancyUpload
};