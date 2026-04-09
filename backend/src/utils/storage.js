const path = require('path');
const fs = require('fs');
const config = require('../config');

/**
 * Get upload directory with year/month structure
 * @returns {string} Full path to upload directory
 */
function getUploadDir() {
  const uploadDir = config.upload.dir;
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Build path: UPLOAD_DIR/year/month
  const targetDir = path.join(uploadDir, year, month);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  return targetDir;
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get full file path (relative to upload directory)
 * @param {string} filename - Filename
 * @param {Date} uploadDate - Optional upload date (defaults to current date)
 * @returns {string} Relative path (year/month/filename)
 */
function getFilePath(filename, uploadDate) {
  const date = uploadDate || new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return path.join(year, month, filename);
}

module.exports = {
  getUploadDir,
  generateFilename,
  getFilePath
};