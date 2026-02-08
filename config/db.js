const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../billz.db'));

// Foydalanuvchi jadvali
const userTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);`;
db.prepare(userTable).run();

const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((column) => column.name === 'phone')) {
  db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
}
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone)').run();

// Maxsulot jadvali
const productTable = `CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT,
  quantity INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  total_price REAL DEFAULT 0
);`;
db.prepare(productTable).run();

// Sotuvlar jadvali
const salesTable = `CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card')),
  sale_time TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  sale_date TEXT NOT NULL DEFAULT (date('now', 'localtime')),
  report_id INTEGER,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(report_id) REFERENCES daily_reports(id)
);`;
db.prepare(salesTable).run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_sales_report_id ON sales(report_id)').run();

// Kunlik yopilgan hisobotlar
const dailyReportsTable = `CREATE TABLE IF NOT EXISTS daily_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date TEXT NOT NULL UNIQUE,
  sold_items_count INTEGER NOT NULL,
  sales_count INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  cash_amount REAL NOT NULL,
  card_amount REAL NOT NULL,
  closed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);`;
db.prepare(dailyReportsTable).run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date)').run();

module.exports = db;
