const express = require('express');
const salesController = require('../controllers/salesController');

const router = express.Router();

router.post('/', salesController.createSale);
router.get('/daily', salesController.getDailySales);
router.get('/history', salesController.getRangeSales);

module.exports = router;
