const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const discrepancyLogsController = require('../controllers/discrepancyLogs');

router.post('/:id/discrepancy-logs', authenticate, discrepancyLogsController.createDiscrepancyLog);

router.post('/:id/discrepancy-logs/submit', authenticate, discrepancyLogsController.discrepancyUpload.any(), discrepancyLogsController.submitDiscrepancyLog);

router.get('/:id/discrepancy-logs', authenticate, discrepancyLogsController.getDiscrepancyLogs);

router.post('/:id/logs/:lid/records', authenticate, discrepancyLogsController.discrepancyUpload.any(), discrepancyLogsController.addLogRecords);

// File download endpoint
router.get('/:id/logs/:lid/records/:rid', authenticate, discrepancyLogsController.downloadDiscrepancyLogFile);

module.exports = router;