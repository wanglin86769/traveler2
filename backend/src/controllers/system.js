const mongoose = require('mongoose');
const config = require('../config');

/**
 * Get system information
 * Returns simplified system status: version, deployment name, database status
 */
const getSystemInfo = async (req, res, next) => {
  try {
    // Database connection status
    const dbStatus = mongoose.connection.readyState;
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const systemInfo = {
      version: config.app.version,
      deploymentName: config.app.deploymentName,
      databaseStatus: dbStatusMap[dbStatus] || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    res.json(systemInfo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemInfo
};