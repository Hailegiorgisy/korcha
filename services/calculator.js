import db from '../config/db.js';

export async function getLiveSettings() {
  const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
  const settings = {};
  rows.forEach(r => { settings[r.setting_key] = parseFloat(r.setting_value); });
  return {
    usdToEtb: settings.usd_to_etb_rate || parseFloat(process.env.USD_TO_ETB_RATE || 125),
    freightPerKg: settings.air_freight_per_kg_etb || parseFloat(process.env.AIR_FREIGHT_PER_KG_ETB || 1600),
    serviceMargin: settings.service_margin_percent || parseFloat(process.env.SERVICE_FEE_PERCENT || 10),
    customsDuty: settings.default_customs_percent || 25
  };
}

export async function calculateLandedCost({ usdPrice, weightKg = 0.35 }) {
  const settings = await getLiveSettings();

  const itemBaseETB = usdPrice * settings.usdToEtb;
  const freightETB = weightKg * settings.freightPerKg;
  const customsETB = itemBaseETB * (settings.customsDuty / 100);
  const subtotalETB = itemBaseETB + freightETB + customsETB;
  const serviceFeeETB = subtotalETB * (settings.serviceMargin / 100);
  const totalETB = Math.ceil(subtotalETB + serviceFeeETB);

  return {
    usdPrice,
    weightKg,
    breakdown: {
      itemBaseETB: Math.round(itemBaseETB),
      freightETB: Math.round(freightETB),
      customsETB: Math.round(customsETB),
      serviceFeeETB: Math.round(serviceFeeETB)
    },
    totalETB,
    exchangeRate: settings.usdToEtb
  };
}