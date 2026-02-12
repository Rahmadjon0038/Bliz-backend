const db = require('../config/db');

class Product {
  static getAll() {
    return db.prepare('SELECT * FROM products').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  static findByName(name) {
    return db.prepare('SELECT * FROM products WHERE name = ?').get(name);
  }

  static create({ name, color, quantity, price }) {
    const total_price = quantity * price;
    const stmt = db.prepare('INSERT INTO products (name, color, quantity, price, total_price) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(name, color, quantity, price, total_price);
  }

  static update(id, { name, color, quantity, price }) {
    const total_price = quantity * price;
    const stmt = db.prepare('UPDATE products SET name = ?, color = ?, quantity = ?, price = ?, total_price = ? WHERE id = ?');
    return stmt.run(name, color, quantity, price, total_price, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }

  static hasSales(id) {
    const row = db.prepare('SELECT COUNT(*) AS count FROM sales WHERE product_id = ?').get(id);
    return row.count > 0;
  }

  static decreaseStock(id, quantity) {
    const stmt = db.prepare(`
      UPDATE products
      SET quantity = quantity - ?,
          total_price = (quantity - ?) * price
      WHERE id = ? AND quantity >= ?
    `);
    return stmt.run(quantity, quantity, id, quantity);
  }
}

module.exports = Product;
