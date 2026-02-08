const Sale = require('../models/Sale');

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

exports.closeDaySales = (req, res) => {
  const date = req.body.date || getTodayDate();
  if (!isValidDate(date)) {
    return res.status(400).json({ message: 'date formati YYYY-MM-DD bo`lishi kerak' });
  }

  const result = Sale.closeDay(date);
  if (result.status === 'already_closed') {
    return res.status(409).json({ message: 'Bu kun allaqachon yopilgan', report: result.report });
  }
  if (result.status === 'no_sales') {
    return res.status(400).json({ message: 'Yopish uchun sotuv topilmadi' });
  }

  return res.json({
    message: 'Kunlik savdo muvaffaqiyatli yopildi',
    report: result.report
  });
};

exports.getDailyReports = (req, res) => {
  const reports = Sale.getDailyReports();
  return res.json({
    reports
  });
};
