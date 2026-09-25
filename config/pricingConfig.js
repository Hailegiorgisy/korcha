// config/pricingConfig.js

// Base exchange rate (USD to ETB), defaulting to 188 if not provided in environment
export const EXCHANGE_RATE = parseFloat(process.env.USD_TO_ETB_RATE) || 188.0;

// Flat 50% markup added to the Shein original price
export const MARKUP_PERCENT = 50;

// Payment split ratios
export const DEPOSIT_PERCENT = 25; // 25% upfront via Telebirr / CBE / M-Pesa
export const COD_PERCENT = 75;     // 75% remaining on delivery