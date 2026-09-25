// backend/services/pricingService.js
import {
  EXCHANGE_RATE,
  MARKUP_PERCENT,
  DEPOSIT_PERCENT,
  COD_PERCENT,
} from "../config/pricingConfig.js";

export function calculateOrderPricing(originalUsdPrice, customExchangeRate) {
  const usd = parseFloat(originalUsdPrice);
  if (isNaN(usd) || usd <= 0) {
    throw new Error("A valid positive USD price is required");
  }

  const activeRate = customExchangeRate ? parseFloat(customExchangeRate) : EXCHANGE_RATE;
  if (isNaN(activeRate) || activeRate <= 0) {
    throw new Error("A valid positive exchange rate is required");
  }

  const markupMultiplier = 1 + MARKUP_PERCENT / 100;
  const finalUsd = Number((usd * markupMultiplier).toFixed(2));
  const totalEtb = Math.round(finalUsd * activeRate);
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
