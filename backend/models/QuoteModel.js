// backend/models/QuoteModel.js
import { calculateOrderPricing } from "../services/pricingService.js";

const quotes = [];

export const QuoteModel = {
  create({ sheinUrl, title, estimatedUsd, selectedSize, selectedColor, notes, customerPhone }) {
    const usd = estimatedUsd ? parseFloat(estimatedUsd) : 18.0;
    const pricing = calculateOrderPricing(usd);

    const newQuote = {
      quoteId: "QR-" + Math.floor(100000 + Math.random() * 900000),
      sheinUrl: sheinUrl.trim(),
      title: title || "Custom Shein Request",
      selectedSize: selectedSize || "Standard",
      selectedColor: selectedColor || "As pictured",
      notes: notes || "",
      customerPhone: customerPhone ? customerPhone.trim() : "",
      pricing,
      status: "Quoted", // "Quoted" | "ConvertedToOrder" | "Expired"
      createdAt: new Date().toISOString(),
    };

    quotes.unshift(newQuote);
    return newQuote;
  },

  findById(quoteId) {
    return quotes.find((q) => q.quoteId === quoteId) || null;
  },

  findAll() {
    return [...quotes];
  },
};
