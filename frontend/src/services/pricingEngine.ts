import { PricingResult } from '../types';

export const DEFAULT_MULTIPLIER = 1.88;
export const DEFAULT_OFFICIAL_RATE = 145.50; // Official Commercial Bank of Ethiopia (CBE) rate
export const DEFAULT_DEPOSIT_PERCENT = 25;

/**
 * Calculates Door-to-Door Birr landed cost based on user's exact specification:
 * (1.88 * original price) * official exchange rate
 */
export function calculateDoorstepPricing(
  originalPriceUsd: number,
  officialExchangeRate: number = DEFAULT_OFFICIAL_RATE,
  multiplier: number = DEFAULT_MULTIPLIER
): PricingResult {
  const cleanUsd = Math.max(0, Number(originalPriceUsd) || 0);
  const landedPriceUsd = cleanUsd * multiplier;
  const totalPriceEtb = Math.round(landedPriceUsd * officialExchangeRate);
  
  // Customer requirement: 25% at that time approximated to near 100 ETB
  const rawDeposit = totalPriceEtb * 0.25;
  const depositAmountEtb = Math.max(100, Math.round(rawDeposit / 100) * 100);
  const codAmountEtb = Math.max(0, totalPriceEtb - depositAmountEtb);

  return {
    originalPriceUsd: Number(cleanUsd.toFixed(2)),
    multiplier,
    landedPriceUsd: Number(landedPriceUsd.toFixed(2)),
    officialExchangeRate,
    totalPriceEtb,
    depositPercent: 25,
    depositAmountEtb,
    codAmountEtb,
  };
}

/**
 * Explains how the 1.88 multiplier is composed for Ethiopian cross-border delivery
 */
export function getMultiplierBreakdown(originalPriceUsd: number) {
  const freightEstimateUsd = originalPriceUsd * 0.45; // ~45% Air Cargo Guangzhou -> Bole Addis
  const customsClearingUsd = originalPriceUsd * 0.28; // ~28% NBE Tariff, customs & declaration
  const localDoorDeliveryUsd = originalPriceUsd * 0.15; // ~15% Landmark logistics & handling
  const totalLandedUsd = originalPriceUsd * DEFAULT_MULTIPLIER;

  return {
    baseProductUsd: originalPriceUsd,
    freightEstimateUsd: Number(freightEstimateUsd.toFixed(2)),
    customsClearingUsd: Number(customsClearingUsd.toFixed(2)),
    localDoorDeliveryUsd: Number(localDoorDeliveryUsd.toFixed(2)),
    totalLandedUsd: Number(totalLandedUsd.toFixed(2)),
  };
}
