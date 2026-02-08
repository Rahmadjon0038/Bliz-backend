const db = require('../config/db');

class User {
  static create({ username, phone, passwordHash }) {
    const stmt = db.prepare('INSERT INTO users (username, phone, password) VALUES (?, ?, ?)');
    return stmt.run(username, phone, passwordHash);
  }

  static findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  static findByPhone(phone) {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  }

  static getAll() {
    return db.prepare('SELECT * FROM users').all();
  }
}

module.exports = User;
