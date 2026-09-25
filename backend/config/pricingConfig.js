// backend/config/pricingConfig.js

export const EXCHANGE_RATE = parseFloat(process.env.USD_TO_ETB_RATE) || 125.0;
export const MARKUP_PERCENT = 50;  // 50% flat markup
export const DEPOSIT_PERCENT = 25; // 25% Telebirr / CBE / M-Pesa deposit
export const COD_PERCENT = 75;     // 75% Cash on Delivery
