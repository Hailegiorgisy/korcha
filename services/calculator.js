import db from '../config/db.js';

// Helper to round up to the nearest high 100 ETB
const roundUp100 = (num) => Math.ceil(num / 100) * 100;

export async function getLiveSettings() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
  const settings = {};
  rows.forEach(r => { settings[r.setting_key] = parseFloat(r.setting_value); });
  return {
    usdToEtb: settings.usd_to_etb_rate || parseFloat(process.env.USD_TO_ETB_RATE || 125)
  };
}

export async function calculateLandedCost({ usdPrice }) {
  const settings = await getLiveSettings();
  const exchangeRate = settings.usdToEtb;

  // Base cost from USD
  const baseItemETB = usdPrice * exchangeRate;

  // 1. 50% additional fee rounded up to nearest 100 ETB
  const additionalFeesETB = roundUp100(baseItemETB * 0.50);

  // 2. Total landed cost rounded up to nearest 100 ETB
  const totalETB = roundUp100(baseItemETB + additionalFeesETB);

  // 3. 25% advance deposit rounded up to nearest 100 ETB
  const depositETB = roundUp100(totalETB * 0.25);

  // Balance payable upon pickup
  const remainingETB = totalETB - depositETB;

  return {
    usdPrice,
    exchangeRate,
    totalETB,
    depositETB,       // 25% rounded up to nearest 100 ETB
    remainingETB,     // Remaining balance
    breakdown: {
      baseItemETB: Math.round(baseItemETB),
      additionalFeesETB
    }
  };
}
