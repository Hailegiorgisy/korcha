// backend/services/pricingService.js
import { EXCHANGE_RATE, LANDED_MULTIPLIER, DEPOSIT_PERCENT } from "../config/pricingConfig.js";

/**
 * Calculates landed pricing in ETB for a given USD price.
 * Formula: (USD * 1.88) * Official Bank Exchange Rate
 * Deposit: 25% approximated to the nearest 100 ETB
 * COD: Remainder payable at point of delivery
 */
export function calculateOrderPricing(usdPrice, customRate = null) {
  const rate = customRate || EXCHANGE_RATE;
  const multiplier = LANDED_MULTIPLIER || 1.88;
  const priceWithMarkupUsd = usdPrice * multiplier;
  const totalPriceEtb = Math.round(priceWithMarkupUsd * rate);

  // 25% deposit approximated to near 100 ETB
  const rawDeposit = totalPriceEtb * 0.25;
  const advanceDepositEtb = Math.max(100, Math.round(rawDeposit / 100) * 100);
  const cashOnDeliveryEtb = Math.max(0, totalPriceEtb - advanceDepositEtb);

  return {
    originalUsdPrice: Number(usdPrice.toFixed(2)),
    scrapedUsd: Number(usdPrice.toFixed(2)),
    exchangeRate: rate,
    multiplier,
    priceWithMarkupUsd: Number(priceWithMarkupUsd.toFixed(2)),
    totalPriceEtb,
    advanceDepositEtb,
    cashOnDeliveryEtb,
    totalEtb: totalPriceEtb,
    depositEtb: advanceDepositEtb,
    codEtb: cashOnDeliveryEtb,
    depositPercent: DEPOSIT_PERCENT,
  };
}
