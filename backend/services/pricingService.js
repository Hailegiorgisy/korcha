// backend/services/pricingService.js
import { EXCHANGE_RATE, MARKUP_PERCENT, DEPOSIT_PERCENT, COD_PERCENT } from "../config/pricingConfig.js";

/**
 * Calculates landed pricing in ETB for a given USD price.
 * Formula: (USD * 1.50) * 188.0 ETB
 * Provides comprehensive aliases for total, deposit, and COD amounts.
 */
export function calculateOrderPricing(usdPrice, customRate = null) {
  const rate = customRate || EXCHANGE_RATE; // 188.0 ETB
  const multiplier = 1 + (MARKUP_PERCENT / 100); // 1.50 (50% markup)

  const priceWithMarkupUsd = usdPrice * multiplier;
  const totalPriceEtb = Math.round(priceWithMarkupUsd * rate);

  const advanceDepositEtb = Math.round(totalPriceEtb * (DEPOSIT_PERCENT / 100)); // 25%
  const cashOnDeliveryEtb = totalPriceEtb - advanceDepositEtb; // 75%

  return {
    originalUsdPrice: Number(usdPrice.toFixed(2)),
    scrapedUsd: Number(usdPrice.toFixed(2)),
    exchangeRate: rate,
    markupPercent: MARKUP_PERCENT,
    priceWithMarkupUsd: Number(priceWithMarkupUsd.toFixed(2)),
    // Primary field names
    totalPriceEtb,
    advanceDepositEtb,
    cashOnDeliveryEtb,
    // Convenient aliases for UI bindings
    totalEtb: totalPriceEtb,
    depositEtb: advanceDepositEtb,
    codEtb: cashOnDeliveryEtb,
    depositPercent: DEPOSIT_PERCENT,
    codPercent: COD_PERCENT,
  };
}
