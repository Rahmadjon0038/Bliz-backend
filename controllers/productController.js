const Product = require('../models/Product');

exports.getAll = (req, res) => {
  const products = Product.getAll();
  res.json(products);
};

exports.create = (req, res) => {
  const { name, color, quantity, price } = req.body;
  if (!name || !color || quantity == null || price == null) {
    return res.status(400).json({ message: 'Barcha maydonlarni to`ldiring' });
  }

  if (Number(quantity) < 0 || Number(price) < 0 || Number.isNaN(Number(quantity)) || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: 'quantity va price musbat son bo`lishi kerak' });
  }

  const numericQuantity = Number(quantity);
  const numericPrice = Number(price);
  const info = Product.create({ name, color, quantity: numericQuantity, price: numericPrice });
  res.json({
    message: 'Maxsulot muvaffaqiyatli qo`shildi',
    id: info.lastInsertRowid,
    name,
    color,
    quantity: numericQuantity,
    price: numericPrice,
    total_price: numericQuantity * numericPrice
  });
};

exports.update = (req, res) => {
  const numericId = Number(req.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return res.status(400).json({ message: 'id musbat butun son bo`lishi kerak' });
  }

  const { name, color, quantity, price } = req.body;

  if (!name || !color || quantity == null || price == null) {
    return res.status(400).json({ message: 'Barcha maydonlarni to`ldiring' });
  }
  if (Number(quantity) < 0 || Number(price) < 0 || Number.isNaN(Number(quantity)) || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: 'quantity va price musbat son bo`lishi kerak' });
  }

  const result = Product.update(numericId, {
    name,
    color,
    quantity: Number(quantity),
    price: Number(price)
  });
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Maxsulot topilmadi' });
  }

  res.json({ message: 'Maxsulot yangilandi' });
};

exports.delete = (req, res) => {
  const numericId = Number(req.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return res.status(400).json({ message: 'id musbat butun son bo`lishi kerak' });
  }

  if (Product.hasSales(numericId)) {
    return res.status(409).json({
      message: 'Bu mahsulot sotuvlarda ishlatilgan, o`chirib bo`lmaydi'
    });
  }

  const result = Product.delete(numericId);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Maxsulot topilmadi' });
  }
  res.json({ message: 'Maxsulot o`chirildi' });
};
