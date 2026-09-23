import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Korcha Cross-Border Engine' });
});

app.listen(PORT, () => {
  console.log(`Korcha server listening on http://localhost:${PORT}`);
});