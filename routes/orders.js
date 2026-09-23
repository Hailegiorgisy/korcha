import express from 'express';
import db from '../config/db.js';
import { parseProductUrl } from '../services/scraper.js';
import { calculateLandedCost } from '../services/calculator.js';
import { initializePayment } from '../services/payment.js';

const router = express.Router();

router.post('/parse-product', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const product = await parseProductUrl(url);
  if (!product.success) {
    return res.status(422).json({ error: product.error });
  }

  const cost = await calculateLandedCost({ usdPrice: product.usdPrice });
  res.json({ product, cost });
});

router.post('/create-order', async (req, res) => {
  const {
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

  if (!customerName || !customerPhone || !productUrl || !usdPrice) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  try {
    const cost = await calculateLandedCost({ usdPrice: parseFloat(usdPrice) });
    const orderNumber = 'KC-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

    const [orderResult] = await db.query(
      `INSERT INTO orders 
      (order_number, customer_name, customer_phone, pickup_location, source_url, product_title, product_image, selected_size, selected_color, usd_price, total_etb, pricing_breakdown) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customerName,
        customerPhone,
        pickupLocation || 'Addis Ababa Bole Pick-up Point',
        productUrl,
        productTitle,
        productImage,
        selectedSize || 'Standard',
        selectedColor || 'As shown',
        cost.usdPrice,
        cost.totalETB,
        JSON.stringify(cost.breakdown)
      ]
    );

    await db.query(
      'INSERT INTO payments (order_id, payment_method, amount_etb, status) VALUES (?, "chapa", ?, "pending")',
      [orderResult.insertId, cost.totalETB]
    );

    // Initialize payment session
    const payment = await initializePayment({
      amountETB: cost.totalETB,
      customerName,
      customerPhone,
      orderNumber
    });

    res.json({
      success: true,
      orderNumber,
      totalETB: cost.totalETB,
      checkoutUrl: payment.checkoutUrl || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Order creation failed: ' + error.message });
  }
});

router.get('/track/:orderNumber', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT order_number, customer_name, product_title, product_image, total_etb, status, tracking_number, pickup_location, created_at 
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