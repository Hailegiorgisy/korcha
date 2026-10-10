// backend/config/pricingConfig.js
// Official floating bank exchange rate (NBE / CBE)
export const EXCHANGE_RATE = parseFloat(process.env.OFFICIAL_EXCHANGE_RATE || process.env.USD_TO_ETB_RATE) || 145.50;

// Landed cost multiplier: 1.88x original price (covers air cargo, customs, clearing, and door delivery)
export const LANDED_MULTIPLIER = 1.88;
export const MARKUP_PERCENT = 88; // 88% added to original price

// Payment split ratios
export const DEPOSIT_PERCENT = 25; // 25% upfront (approximated to near 100 ETB)
export const COD_PERCENT = 75;     // 75% Cash on Delivery

// Digital payment receiver details
export const TELEBIRR_RECEIVER_PHONE = process.env.TELEBIRR_RECEIVER_PHONE || "+251911234567";
export const TELEBIRR_RECEIVER_NAME = process.env.TELEBIRR_RECEIVER_NAME || "Korcha Logistics (ኮርቻ ሎጂስቲክስ)";
export const CBE_ACCOUNT_NUMBER = process.env.CBE_ACCOUNT_NUMBER || "1000123456789";
