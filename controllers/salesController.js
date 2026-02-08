const Product = require('../models/Product');
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

exports.createSale = (req, res) => {
  const { productId, quantity, paymentMethod } = req.body;

  if (productId == null || quantity == null || !paymentMethod) {
    return res.status(400).json({ message: 'productId, quantity va paymentMethod majburiy' });
  }

  const numericProductId = Number(productId);
  const numericQuantity = Number(quantity);
  if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
    return res.status(400).json({ message: 'productId musbat butun son bo`lishi kerak' });
  }
  if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
    return res.status(400).json({ message: 'quantity butun va musbat son bo`lishi kerak' });
  }
  if (!['cash', 'card'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'paymentMethod faqat cash yoki card bo`lishi kerak' });
  }

  const product = Product.findById(numericProductId);
  if (!product) {
    return res.status(404).json({ message: 'Bunday mahsulot omborda topilmadi' });
  }

  const stockUpdate = Product.decreaseStock(numericProductId, numericQuantity);
  if (stockUpdate.changes === 0) {
    return res.status(400).json({ message: 'Omborda yetarli miqdor yo`q' });
  }

  const info = Sale.create({
    productId: product.id,
    productName: product.name,
    quantity: numericQuantity,
    unitPrice: product.price,
    paymentMethod
  });
  const createdSale = Sale.findById(info.lastInsertRowid);
  const updatedProduct = Product.findById(product.id);

  return res.status(201).json({
    message: 'Sotuv muvaffaqiyatli amalga oshirildi',
    sale: createdSale,
    product: {
      id: updatedProduct.id,
      name: updatedProduct.name,
      remainingQuantity: updatedProduct.quantity
    }
  });
};

exports.getDailySales = (req, res) => {
  const date = req.query.date || getTodayDate();
  if (!isValidDate(date)) {
    return res.status(400).json({ message: 'date formati YYYY-MM-DD bo`lishi kerak' });
  }

  const sales = Sale.getByDate(date);
  const summary = Sale.getSummaryByDate(date);
  return res.json({
    date,
    summary,
    sales
  });
};

exports.getRangeSales = (req, res) => {
  const sales = Sale.getAllHistory();
  const groupedMap = new Map();

  for (const sale of sales) {
    if (!groupedMap.has(sale.sale_date)) {
      groupedMap.set(sale.sale_date, {
        date: sale.sale_date,
        summary: {
          total_amount: 0,
          cash_amount: 0,
          card_amount: 0,
          sold_items_count: 0,
          sales_count: 0
        },
        sales: []
      });
    }

    const group = groupedMap.get(sale.sale_date);
    group.sales.push(sale);
    group.summary.total_amount += sale.total_price;
    group.summary.sold_items_count += sale.quantity;
    group.summary.sales_count += 1;
    if (sale.payment_method === 'cash') {
      group.summary.cash_amount += sale.total_price;
    } else if (sale.payment_method === 'card') {
      group.summary.card_amount += sale.total_price;
    }
  }

  const history = Array.from(groupedMap.values());
  return res.json({
    history
  });
};
