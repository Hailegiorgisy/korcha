import express from 'express';
import db from '../config/db.js';
import { parseProductUrl } from '../services/scraper.js';
import { calculateLandedCost } from '../services/calculator.js';
import { initializePayment } from '../services/payment.js';

const router = express.Router();

// 1. Parse Shein Link & Calculate Landed Cost
router.post('/parse-product', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Shein URL is required' });

  const product = await parseProductUrl(url);
  if (!product.success) {
    return res.status(422).json({ error: product.error });
  }

  const cost = await calculateLandedCost({ usdPrice: product.usdPrice });
  res.json({ product, cost });
});

// 2. Create Order (Option 1: 25 ETB Access Pass OR Option 2: 25% Deposit Order)
router.post('/create-order', async (req, res) => {
  const {
    orderType = 'product_order', // 'access_pass' or 'product_order'
    customerName,
    customerPhone,
    pickupLocation,
    productUrl,
    productTitle,
    productImage,
    selectedSize,
    selectedColor,
    usdPrice
  } = req.body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  try {
    const orderNumber = 'KC-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
    let amountToChargeETB = 0;
    let fullTotalETB = 0;
    let titleToSave = productTitle || 'Shein Direct Access Pass';

    if (orderType === 'access_pass') {
      // Option 1: 25 ETB flat fee
      amountToChargeETB = 25;
      fullTotalETB = 25;
      titleToSave = 'Shein Direct Access Pass (25 ETB)';
    } else {
      // Option 2: 25% down payment
      const cost = await calculateLandedCost({ usdPrice: parseFloat(usdPrice || 10) });
      amountToChargeETB = cost.depositETB; // 25%
      fullTotalETB = cost.totalETB;
    }

    const [orderResult] = await db.query(
      `INSERT INTO orders 
      (order_number, customer_name, customer_phone, pickup_location, source_url, product_title, product_image, selected_size, selected_color, usd_price, total_etb, pricing_breakdown) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customerName,
        customerPhone,
        pickupLocation || 'Bole Medhanialem Hub (Addis Ababa)',
        productUrl || 'https://www.shein.com',
        titleToSave,
        productImage || '',
        selectedSize || 'N/A',
        selectedColor || 'N/A',
        parseFloat(usdPrice || 0),
        fullTotalETB,
        JSON.stringify({ depositPaid: amountToChargeETB, balanceDue: fullTotalETB - amountToChargeETB })
      ]
    );

    // Record pending transaction
    await db.query(
      'INSERT INTO payments (order_id, payment_method, amount_etb, status) VALUES (?, "telebirr", ?, "pending")',
      [orderResult.insertId, amountToChargeETB]
    );

    // Initialize Telebirr/CBE payment session via Chapa
    const payment = await initializePayment({
      amountETB: amountToChargeETB,
      customerName,
      customerPhone,
      orderNumber
    });

    res.json({
      success: true,
      orderNumber,
      amountCharged: amountToChargeETB,
      fullTotal: fullTotalETB,
      checkoutUrl: payment.checkoutUrl || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Order placement failed: ' + error.message });
  }
});

// 3. Track Order
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT order_number, customer_name, product_title, product_image, total_etb, status, tracking_number, pickup_location, pricing_breakdown, created_at 
       FROM orders WHERE order_number = ?`,
      [req.params.orderNumber]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ order: orders[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;