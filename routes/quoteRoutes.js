// routes/quoteRoutes.js
import express from "express";
import { calculateOrderPricing } from "../services/pricingService.js";
import {
  EXCHANGE_RATE,
  MARKUP_PERCENT,
  DEPOSIT_PERCENT,
  COD_PERCENT,
} from "../config/pricingConfig.js";

const router = express.Router();

// POST /api/quote/calculate
// Request body: { "usdPrice": 24.50, "customRate": 128.5 } (customRate is optional)
router.post("/calculate", (req, res) => {
  try {
    const { usdPrice, customRate } = req.body;

    if (usdPrice === undefined || usdPrice === null) {
      return res.status(400).json({ error: "usdPrice is required" });
    }

    const result = calculateOrderPricing(usdPrice, customRate);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/quote/rates - View active system parameters
router.get("/rates", (req, res) => {
  res.status(200).json({
    exchangeRate: EXCHANGE_RATE,
    markupPercent: MARKUP_PERCENT,
    depositPercent: DEPOSIT_PERCENT,
    codPercent: COD_PERCENT,
  });
});

export default router;