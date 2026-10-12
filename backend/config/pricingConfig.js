// backend/config/pricingConfig.js
/**
 * Korcha Ethiopia Doorstep Pricing Configuration
 * - HKD to ETB exchange rate: 30 ETB / HKD (or configurable)
 * - USD to HKD pegged rate: 7.8
 * - Supplier markup: +27%
 * - Cargo rate: 1,000 ETB per 1 kg (Size limit: max 50cm x 50cm)
 * - Delivery service fee: +54%
 * - 25% Upfront Pre-Payment (nearest 100 ETB)
 * - 75% Doorstep Delivery COD
 */

export const HKD_EXCHANGE_RATE = parseFloat(process.env.HKD_EXCHANGE_RATE || "30.0");
export const USD_TO_HKD = parseFloat(process.env.USD_TO_HKD || "7.8");
export const KG_CARGO_RATE_ETB = parseFloat(process.env.KG_CARGO_RATE_ETB || "1000.0");
export const SUPPLIER_PERCENT = 0.27; // +27%
export const DELIVERY_PERCENT = 0.54; // +54%
export const MAX_SIZE_CM = 50;        // 50cm x 50cm

export const DEPOSIT_PERCENT = 25;
export const COD_PERCENT = 75;

// Legacy variables for backward compatibility
export const EXCHANGE_RATE = HKD_EXCHANGE_RATE;
export const LANDED_MULTIPLIER = 1.88;

// Telegram Bot & Dispatch
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const TELEGRAM_WORKER_CHAT_ID = process.env.TELEGRAM_WORKER_CHAT_ID || "";
export const WORKER_TELEGRAM_USERNAME = process.env.WORKER_TELEGRAM_USERNAME || "korcha_support";

// Payment Accounts
export const TELEBIRR_PHONE = process.env.TELEBIRR_PHONE || process.env.TELEBIRR_RECEIVER_PHONE || "+251911234567";
export const TELEBIRR_RECEIVER_PHONE = TELEBIRR_PHONE;
export const TELEBIRR_RECEIVER_NAME = process.env.TELEBIRR_RECEIVER_NAME || "Korcha Logistics (ኮርቻ ሎጂስቲክስ)";
export const CBE_ACCOUNT = process.env.CBE_ACCOUNT || process.env.CBE_ACCOUNT_NUMBER || "1000123456789";
export const CBE_ACCOUNT_NUMBER = CBE_ACCOUNT;
