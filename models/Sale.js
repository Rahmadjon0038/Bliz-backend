const db = require('../config/db');

class Sale {
  static create({ productId, productName, quantity, unitPrice, paymentMethod }) {
    const totalPrice = quantity * unitPrice;
    const stmt = db.prepare(`
      INSERT INTO sales (product_id, product_name, quantity, unit_price, total_price, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(productId, productName, quantity, unitPrice, totalPrice, paymentMethod);
  }

  static findById(id) {
    return db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
  }

  static getByDate(date) {
    return db
      .prepare(
        `SELECT id, product_name, quantity, unit_price, total_price, payment_method, sale_time, sale_date
         FROM sales
         WHERE sale_date = ?
         ORDER BY sale_time DESC, id DESC`
      )
      .all(date);
  }

  static getByDateRange(from, to) {
    return db
      .prepare(
        `SELECT id, product_name, quantity, unit_price, total_price, payment_method, sale_time, sale_date
         FROM sales
         WHERE sale_date BETWEEN ? AND ?
         ORDER BY sale_date DESC, sale_time DESC, id DESC`
      )
      .all(from, to);
  }

  static getAllHistory() {
    return db
      .prepare(
        `SELECT id, product_name, quantity, unit_price, total_price, payment_method, sale_time, sale_date
         FROM sales
         ORDER BY sale_date DESC, sale_time DESC, id DESC`
      )
      .all();
  }

  static getSummaryByDate(date) {
    return db
      .prepare(
        `SELECT
           COALESCE(SUM(total_price), 0) AS total_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_price ELSE 0 END), 0) AS cash_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_price ELSE 0 END), 0) AS card_amount,
           COALESCE(SUM(quantity), 0) AS sold_items_count,
           COUNT(*) AS sales_count
         FROM sales
         WHERE sale_date = ?`
      )
      .get(date);
  }

  static getSummaryByDateRange(from, to) {
    return db
      .prepare(
        `SELECT
           COALESCE(SUM(total_price), 0) AS total_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_price ELSE 0 END), 0) AS cash_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_price ELSE 0 END), 0) AS card_amount,
           COALESCE(SUM(quantity), 0) AS sold_items_count,
           COUNT(*) AS sales_count
         FROM sales
         WHERE sale_date BETWEEN ? AND ?`
      )
      .get(from, to);
  }

  static getUnclosedSummaryByDate(date) {
    return db
      .prepare(
        `SELECT
           COALESCE(SUM(total_price), 0) AS total_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_price ELSE 0 END), 0) AS cash_amount,
           COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_price ELSE 0 END), 0) AS card_amount,
           COALESCE(SUM(quantity), 0) AS sold_items_count,
           COUNT(*) AS sales_count
         FROM sales
         WHERE sale_date = ? AND report_id IS NULL`
      )
      .get(date);
  }

  static hasUnclosedSalesByDate(date) {
    const row = db.prepare('SELECT COUNT(*) AS count FROM sales WHERE sale_date = ? AND report_id IS NULL').get(date);
    return row.count > 0;
  }

  static getReportByDate(date) {
    return db.prepare('SELECT * FROM daily_reports WHERE report_date = ?').get(date);
  }

  static closeDay(date) {
    const runTx = db.transaction((reportDate) => {
      const existingReport = db.prepare('SELECT * FROM daily_reports WHERE report_date = ?').get(reportDate);
      if (existingReport) {
        return { status: 'already_closed', report: existingReport };
      }

      const summary = Sale.getUnclosedSummaryByDate(reportDate);
      if (!summary || summary.sales_count === 0) {
        return { status: 'no_sales' };
      }

      const insert = db.prepare(`
        INSERT INTO daily_reports (
          report_date, sold_items_count, sales_count, total_amount, cash_amount, card_amount
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = insert.run(
        reportDate,
        summary.sold_items_count,
        summary.sales_count,
        summary.total_amount,
        summary.cash_amount,
        summary.card_amount
      );

      db.prepare('UPDATE sales SET report_id = ? WHERE sale_date = ? AND report_id IS NULL').run(info.lastInsertRowid, reportDate);
      const report = db.prepare('SELECT * FROM daily_reports WHERE id = ?').get(info.lastInsertRowid);
      return { status: 'closed', report };
    });

    return runTx(date);
  }

  static getDailyReports() {
    return db
      .prepare(
        `SELECT report_date, sold_items_count, sales_count, total_amount, cash_amount, card_amount, closed_at
         FROM daily_reports
         ORDER BY report_date DESC`
      )
      .all();
  }
}

module.exports = Sale;
