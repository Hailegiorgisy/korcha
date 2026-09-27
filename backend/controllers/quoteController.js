// backend/controllers/quoteController.js
import { QuoteModel } from "../models/QuoteModel.js";
import { parseSheinProduct } from "../services/sheinParserService.js";
import { calculateOrderPricing } from "../services/pricingService.js";

export const quoteController = {
  async parseUrl(req, res) {
    try {
      const { url, manualUsdPrice } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Shein URL is required" });
      }
      const data = await parseSheinProduct(url, manualUsdPrice);
      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  createQuoteRequest(req, res) {
    try {
      const { sheinUrl, title, estimatedUsd, selectedSize, selectedColor, notes, customerPhone } = req.body;
      if (!sheinUrl) {
        return res.status(400).json({ error: "Shein URL is required for a quote request" });
      }

      const quote = QuoteModel.create({
        sheinUrl,
        title,
        estimatedUsd,
        selectedSize,
        selectedColor,
        notes,
        customerPhone,
      });

      res.status(201).json(quote);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getQuoteById(req, res) {
    try {
      const quote = QuoteModel.findById(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.status(200).json(quote);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  calculateCustomPrice(req, res) {
    try {
      const { usdPrice, customRate } = req.body;
      if (usdPrice === undefined) {
        return res.status(400).json({ error: "usdPrice is required" });
      }
      const pricing = calculateOrderPricing(usdPrice, customRate);
      res.status(200).json(pricing);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
