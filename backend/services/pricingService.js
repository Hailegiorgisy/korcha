// backend/services/pricingService.js
import {
  HKD_EXCHANGE_RATE,
  USD_TO_HKD,
  KG_CARGO_RATE_ETB,
  SUPPLIER_PERCENT,
  DELIVERY_PERCENT,
  MAX_SIZE_CM,
  DEPOSIT_PERCENT,
  COD_PERCENT,
} from "../config/pricingConfig.js";

/**
 * Estimates item weight in kg based on item category or name
 */
export function estimateCategoryWeight(categoryOrTitle = "") {
  const t = categoryOrTitle.toLowerCase();
  if (t.includes("boot") || t.includes("winter") || t.includes("luggage") || t.includes("sneaker") || t.includes("shoes")) {
    return 0.85;
  }
  if (t.includes("hoodie") || t.includes("jacket") || t.includes("sweater") || t.includes("bag") || t.includes("backpack")) {
    return 0.55;
  }
  if (t.includes("dress") || t.includes("skirt") || t.includes("shirt") || t.includes("blouse") || t.includes("kemis")) {
    return 0.35;
  }
  if (t.includes("earbud") || t.includes("watch") || t.includes("jewelry") || t.includes("case")) {
    return 0.15;
  }
  if (t.includes("electronics") || t.includes("keyboard") || t.includes("kitchen")) {
    return 0.70;
  }
  return 0.40;
}

/**
 * Calculates landed pricing in ETB for a given USD price.
 * 1. Price converted using HKD to ETB exchange rate (~30 ETB per HKD, 7.8 HKD/USD)
 * 2. Cargo weight calculation: 1,000 ETB per 1 kg (Size limit: max 50cm x 50cm)
 * 3. +27% for supplier
 * 4. +54% for delivery service
 * 5. 25% upfront pre-payment (approximated to nearest 100 ETB)
 * 6. 75% Doorstep Delivery COD
 */
export function calculateOrderPricing(usdPrice, customWeightKg = null, customDimensions = null) {
  const cleanUsd = Math.max(0, Number(usdPrice) || 0);
  const priceHkd = cleanUsd * USD_TO_HKD;
  const baseEtbAmount = Math.round(priceHkd * HKD_EXCHANGE_RATE);

  const cargoWeightKg = customWeightKg && customWeightKg > 0 ? customWeightKg : 0.40;
  const cargoCostEtb = Math.round(cargoWeightKg * KG_CARGO_RATE_ETB);

  const supplierFeeEtb = Math.round(baseEtbAmount * SUPPLIER_PERCENT);
  const deliveryFeeEtb = Math.round(baseEtbAmount * DELIVERY_PERCENT);

  const totalPriceEtb = Math.round(baseEtbAmount + supplierFeeEtb + deliveryFeeEtb + cargoCostEtb);

  // 25% deposit approximated to near 100 ETB
  const rawDeposit = totalPriceEtb * (DEPOSIT_PERCENT / 100);
  const advanceDepositEtb = Math.max(100, Math.round(rawDeposit / 100) * 100);
  const cashOnDeliveryEtb = Math.max(0, totalPriceEtb - advanceDepositEtb);

  const lengthCm = customDimensions?.lengthCm ?? 30;
  const widthCm = customDimensions?.widthCm ?? 30;
  const isOversized = lengthCm > MAX_SIZE_CM || widthCm > MAX_SIZE_CM;

  return {
    originalUsdPrice: Number(cleanUsd.toFixed(2)),
    scrapedUsd: Number(cleanUsd.toFixed(2)),
    priceHkd: Number(priceHkd.toFixed(2)),
    hkdExchangeRate: HKD_EXCHANGE_RATE,
    baseEtbAmount,
    supplierFeeEtb,
    deliveryFeeEtb,
    cargoWeightKg: Number(cargoWeightKg.toFixed(2)),
    cargoCostEtb,
    dimensions: `${lengthCm}cm x ${widthCm}cm`,
    isOversized,
    totalPriceEtb,
    advanceDepositEtb,
    cashOnDeliveryEtb,
    totalEtb: totalPriceEtb,
    depositEtb: advanceDepositEtb,
    codEtb: cashOnDeliveryEtb,
    depositPercent: DEPOSIT_PERCENT,
    codPercent: COD_PERCENT,
  };
}
