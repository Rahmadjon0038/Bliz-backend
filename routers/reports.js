const express = require('express');
const reportsController = require('../controllers/reportsController');

const router = express.Router();

router.post('/close-day', reportsController.closeDaySales);
router.get('/daily', reportsController.getDailyReports);

module.exports = router;
