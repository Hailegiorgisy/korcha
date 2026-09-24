import db from '../config/db.js';

export async function getLiveSettings() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
  const settings = {};
  rows.forEach(r => { settings[r.setting_key] = parseFloat(r.setting_value); });
  return {
    usdToEtb: settings.usd_to_etb_rate || parseFloat(process.env.USD_TO_ETB_RATE || 190)
  };
}

export async function calculateLandedCost({ usdPrice }) {
  const settings = await getLiveSettings();
  const exchangeRate = settings.usdToEtb;

  // Formula: USD * Rate + 50% for air freight, customs, and operational costs
  const baseItemETB = usdPrice * exchangeRate;
  const additionalFeesETB = baseItemETB * 0.50; // +50% overhead
  const totalETB = Math.ceil(baseItemETB + additionalFeesETB);

  // Customer pays 25% deposit upfront; 75% on delivery
  const depositETB = Math.ceil(totalETB * 0.25);
  const remainingETB = totalETB - depositETB;

  return {
    usdPrice,
    exchangeRate,
    totalETB,
    depositETB,       // 25% down payment
    remainingETB,     // 75% upon pickup
    breakdown: {
      baseItemETB: Math.round(baseItemETB),
      additionalFeesETB: Math.round(additionalFeesETB)
    }
  };
}