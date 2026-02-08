const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../services/smsService');
const { jwtSecret, jwtRefreshSecret } = require('../config/app');

function isValidPhone(phone) {
  return /^\+?[1-9]\d{8,14}$/.test(phone);
}

function findUserByPassword(password) {
  const users = User.getAll();
  return users.find((user) => bcrypt.compareSync(password, user.password));
}

exports.register = (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password || password.length < 4) {
    return res.status(400).json({ message: 'Telefon raqami va parol to`g`ri kiriting (parol kamida 4 xonali)' });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: 'Telefon raqami formati noto`g`ri. Masalan: +998901234567' });
  }

  const existingUser = User.findByPhone(phone);
  if (existingUser) {
    return res.status(409).json({ message: 'Bu telefon raqam allaqachon ro`yxatdan o`tgan' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const username = `user_${Date.now()}`;
  const info = User.create({ username, phone, passwordHash });
  sendSms(phone, 'Tizimga muvaffaqiyatli ro`yxatdan o`tdingiz');

  res.status(201).json({ id: info.lastInsertRowid, phone });
};

exports.login = (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 4) {
    return res.status(400).json({ message: 'Parol to`g`ri kiriting (kamida 4 xonali)' });
  }

  const user = findUserByPassword(password);
  if (!user) {
    return res.status(401).json({ message: 'Parol xato' });
  }

  const token = jwt.sign({ id: user.id, phone: user.phone }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id, phone: user.phone }, jwtRefreshSecret, { expiresIn: '7d' });
  sendSms(user.phone, 'Tizimga muvaffaqiyatli kirildi');

  res.json({
    message: 'Tizimga muvaffaqiyatli kirildi',
    token,
    refreshToken,
    user: {
      id: user.id,
      phone: user.phone
    }
  });
};
