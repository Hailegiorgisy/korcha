import express from 'express';
import db from '../config/db.js';
import { verifyPayment } from '../services/payment.js';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const event = req.body;
  const txRef = event?.tx_ref;
  if (!txRef) return res.sendStatus(400);

  const verification = await verifyPayment(txRef);

  if (verification?.status === 'success') {
    await db.query(`UPDATE orders SET status = 'paid' WHERE order_number = ?`, [txRef]);
    await db.query(
      `UPDATE payments SET status = 'completed', gateway_response = ? 
       WHERE order_id = (SELECT id FROM orders WHERE order_number = ?)`,
      [JSON.stringify(verification), txRef]
    );
  }

  res.sendStatus(200);
});

export default router;