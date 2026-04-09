const path = require('path');
const fs = require('fs');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const { TravelerData } = require('../models/Traveler');

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

/**
 * Verify file access permissions
 * Checks if the user has permission to access the requested file
 */
const verifyFileAccess = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const userId = req.user._id;
    
    // Find the traveler data record that contains this file
    const data = await TravelerData.findOne({
      'file.path': filename
    });

    if (!data) {
      throw new ApiError(404, 'File not found');
    }

    // Check if user has access to the traveler
    const traveler = await require('../models/Traveler').Traveler.findById(data.traveler);
    
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    // Check if user is the owner or has admin role
    const isOwner = traveler.createdBy && traveler.createdBy.toString() === userId.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Access denied');
    }

    // Store file context for later use
    req.fileContext = {
      data,
      traveler,
      filePath: path.join(config.upload.dir, data.file.path)
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUploadDir,
  generateFilename,
  getFilePath,
  verifyFileAccess
};