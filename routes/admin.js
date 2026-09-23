import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, order_number, customer_name, customer_phone, pickup_location, source_url, 
              product_title, selected_size, selected_color, usd_price, total_etb, status, tracking_number, created_at 
       FROM orders ORDER BY id DESC`
    );
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:id/status', async (req, res) => {
  const { status, trackingNumber } = req.body;
  try {
    await db.query(
      `UPDATE orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ?`,
      [status, trackingNumber, req.params.id]
    );
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  const { usdToEtb, freightPerKg } = req.body;
  try {
    if (usdToEtb) {
      await db.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = "usd_to_etb_rate"', [usdToEtb]);
    }
    if (freightPerKg) {
      await db.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = "air_freight_per_kg_etb"', [freightPerKg]);
    }
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;