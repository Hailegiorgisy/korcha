// services/pricingService.js
import {
  EXCHANGE_RATE,
  MARKUP_PERCENT,
  DEPOSIT_PERCENT,
  COD_PERCENT,
} from "../config/pricingConfig.js";

/**
 * Calculates total ETB price, upfront deposit, and COD balance.
 * Formula: (Original USD * 1.50) * Exchange Rate
 *
 * @param {number|string} originalUsdPrice - Price from Shein in USD
 * @param {number|string} [customExchangeRate] - Optional custom exchange rate override
 */
export function calculateOrderPricing(originalUsdPrice, customExchangeRate) {
  const usd = parseFloat(originalUsdPrice);

  if (isNaN(usd) || usd <= 0) {
    throw new Error("A valid positive USD price is required");
  }

  const activeRate = customExchangeRate ? parseFloat(customExchangeRate) : EXCHANGE_RATE;
  if (isNaN(activeRate) || activeRate <= 0) {
    throw new Error("A valid positive exchange rate is required");
  }

  // 1. Add 50% markup
  const markupMultiplier = 1 + MARKUP_PERCENT / 100; // 1.50
  const finalUsd = Number((usd * markupMultiplier).toFixed(2));

  // 2. Convert to ETB (rounded to whole Birr)
  const totalEtb = Math.round(finalUsd * activeRate);

  // 3. Compute 25% deposit and 75% COD balance
  const depositEtb = Math.round(totalEtb * (DEPOSIT_PERCENT / 100));
  const codEtb = totalEtb - depositEtb;

  return {
    originalUsd: usd,
    markupPercent: MARKUP_PERCENT,
    finalUsd,
    exchangeRate: activeRate,
    totalEtb,
    depositEtb,
    codEtb,
  };
}