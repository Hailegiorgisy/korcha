// backend/routes/quoteRoutes.js
import express from "express";
import { calculateOrderPricing } from "../services/pricingService.js";
import { parseSheinProduct } from "../services/sheinParserService.js";
import {
  EXCHANGE_RATE,
  MARKUP_PERCENT,
  DEPOSIT_PERCENT,
  COD_PERCENT,
} from "../config/pricingConfig.js";

const router = express.Router();

router.post("/calculate", (req, res) => {
  try {
    const { usdPrice, customRate } = req.body;
    if (usdPrice === undefined || usdPrice === null) {
      return res.status(400).json({ error: "usdPrice is required" });
    }
    const result = calculateOrderPricing(usdPrice, customRate);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/parse-url", async (req, res) => {
  try {
    const { url, manualUsdPrice } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Shein URL is required" });
    }
    const result = await parseSheinProduct(url, manualUsdPrice);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/rates", (req, res) => {
  res.status(200).json({
    exchangeRate: EXCHANGE_RATE,
    markupPercent: MARKUP_PERCENT,
    depositPercent: DEPOSIT_PERCENT,
    codPercent: COD_PERCENT,
  });
});

export default router;
