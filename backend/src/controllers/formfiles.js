const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FormFile } = require('../models/Form');
const ApiError = require('../utils/ApiError');
const { getUploadDir, generateFilename, getFilePath } = require('../utils/storage');
const config = require('../config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Download form file
const getFormFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const uploadDir = config.upload.dir;
    
    const formFile = await FormFile.findById(id);
    
    if (!formFile) {
      throw new ApiError(404, 'Form file not found');
    }

    const filePath = path.join(uploadDir, formFile.file.path);
    
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found');
    }

    res.download(filePath, formFile.value);
  } catch (error) {
    next(error);
  }
};

// Get form file content
const getFormFileContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const uploadDir = config.upload.dir;
    
    const formFile = await FormFile.findById(id);
    
    if (!formFile) {
      throw new ApiError(404, 'Form file not found');
    }

    const filePath = path.join(uploadDir, formFile.file.path);
    
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found');
    }

    res.download(filePath, formFile.value);
  } catch (error) {
    next(error);
  }
};

// Delete form file
const deleteFormFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const uploadDir = config.upload.dir;
    
    const formFile = await FormFile.findById(fileId);
    
    if (!formFile) {
      throw new ApiError(404, 'Form file not found');
    }

    const filePath = path.join(uploadDir, formFile.file.path);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await FormFile.findByIdAndDelete(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFormFile,
  getFormFileContent,
  deleteFormFile,
  imageUpload
};