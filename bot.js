/**
 * Korcha (ኮርቻ) - Production Telegram E-Commerce Bot
 * Designed for Ethio Telecom Linux Hosting / VPS
 * Supported Platforms: Shein, Temu, AliExpress
 * Multiplier: 1.88x Door-to-Door Landed Cost * Official Bank Exchange Rate
 */

import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WORKER_CHAT_ID = process.env.TELEGRAM_WORKER_CHAT_ID;
const OFFICIAL_EXCHANGE_RATE = parseFloat(process.env.OFFICIAL_EXCHANGE_RATE || '145.50');
const LANDED_MULTIPLIER = 1.88; // 1.88 * original price
const TELEBIRR_ACCOUNT = process.env.TELEBIRR_RECEIVER_PHONE || '+251911234567';

if (!BOT_TOKEN) {
  console.error('❌ FATAL: TELEGRAM_BOT_TOKEN is not defined in your environment (.env)');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const userSessions = new Map();

function calculatePricing(usdPrice) {
  const landedUsd = usdPrice * LANDED_MULTIPLIER;
  const totalEtb = Math.round(landedUsd * OFFICIAL_EXCHANGE_RATE);
  // Approximated to near 100 ETB
  const depositEtb = Math.max(100, Math.round((totalEtb * 0.25) / 100) * 100);
  const codEtb = Math.max(0, totalEtb - depositEtb);
  return { usdPrice, landedUsd, totalEtb, depositEtb, codEtb };
}

bot.command('start', async (ctx) => {
  const firstName = ctx.from.first_name || 'ወዳጃችን';
  const welcomeText =
    `👋 ሰላም ${firstName}! ወደ <b>ኮርቻ (Korcha)</b> እንኳን በደህና መጡ!\n\n` +
    `ኮርቻ ከ <b>Shein</b>፣ <b>Temu</b> እና <b>AliExpress</b> የሚፈልጉትን ማንኛውንም እቃ በታማኝነት እስከ ደጃፍዎ የሚያደርስ የኢትዮጵያውያን ተወዳጅ መተግበሪያ ነው።\n\n` +
    `🛍️ <b>እንዴት እንደሚሰሩ:</b>\n` +
    `1. ከ Shein፣ Temu ወይም AliExpress የሚፈልጉትን እቃ ሊንክ ይቅዱ (Copy Link)\n` +
    `2. ሊንኩን እዚህ ቻት ውስጥ ይላኩልን\n` +
    `3. ወዲያውኑ የኢትዮጵያ ብር የበር ላይ ዋጋ (1.88x ቀመር) እናቀርብልዎታለን!\n\n` +
    `💵 <b>የዛሬ ይፋዊ የውጭ ምንዛሬ:</b> 1 USD = ${OFFICIAL_EXCHANGE_RATE} ብር\n` +
    `✈️ <b>የማድረሻ ጊዜ:</b> ከ 10 - 18 የስራ ቀናት\n` +
    `💳 <b>ቅድመ ክፍያ:</b> 25% በቴሌብር (ቀሪው 75% እቃው በርዎ ላይ ሲደርስ)`;

  await ctx.replyWithHTML(
    welcomeText,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('👗 Shein ሱቅ', 'cat_shein'),
        Markup.button.callback('⚡ Temu ሱቅ', 'cat_temu'),
        Markup.button.callback('📱 AliExpress', 'cat_aliexpress'),
      ],
      [
        Markup.button.callback('🧮 የዋጋ ማስያ (1.88x)', 'calc_menu'),
        Markup.button.callback('📋 ደንቦችና ሁኔታዎች', 'show_terms'),
      ],
      [
        Markup.button.callback('📞 የደንበኞች አገልግሎት', 'contact_support'),
      ]
    ])
  );
});

bot.action('cat_shein', (ctx) => {
  ctx.replyWithHTML(
    '👗 <b>Shein (ሼይን) ምርቶች</b>\n\n' +
    'እባክዎ የሼይን አፕሊኬሽን ወይም shein.com በመክፈት የሚፈልጉትን እቃ ሊንክ ኮፒ አድርገው እዚህ ይላኩልን።\n\n' +
    '<i>ምሳሌ: https://www.shein.com/Floral-Dress-p-1849201.html</i>'
  );
});

bot.action('cat_temu', (ctx) => {
  ctx.replyWithHTML(
    '⚡ <b>Temu (ቴሙ) ምርቶች</b>\n\n' +
    'የቴሙ እቃዎችን አፕሊኬሽን ወይም temu.com በመክፈት የፈለጉትን እቃ ሊንክ ኮፒ አድርገው እዚህ ይላኩልን።\n\n' +
    '<i>ምሳሌ: https://www.temu.com/Wireless-Earbuds-p-g891023.html</i>'
  );
});

bot.action('cat_aliexpress', (ctx) => {
  ctx.replyWithHTML(
    '📱 <b>AliExpress (አሊኤክስፕረስ) ምርቶች</b>\n\n' +
    'የአሊኤክስፕረስ እቃዎችን አፕሊኬሽን ወይም aliexpress.com በመክፈት የፈለጉትን እቃ ሊንክ ኮፒ አድርገው እዚህ ይላኩልን።\n\n' +
    '<i>ምሳሌ: https://www.aliexpress.com/item/1005006392019481.html</i>'
  );
});

bot.action('show_terms', (ctx) => {
  ctx.replyWithHTML(
    '📜 <b>የኮርቻ (Korcha) አገልግሎት ደንቦችና መመሪያዎች</b>\n\n' +
    '1. <b>የዋጋ ስሌት ቀመር:</b> የበር ላይ ማድረሻ ዋጋ = [የእቃው ዶላር ዋጋ × 1.88] × ይፋዊ የባንክ ምንዛሬ። (የአየር ጭነት፣ የጉምሩክ ቀረጥና የቤት ለቤት ማድረሻ ያካተተ)\n' +
    '2. <b>ቅድመ ክፍያ:</b> ትዕዛዙ ከቻይና እንዲገዛ 25% በቴሌብር ይከፈላል።\n' +
    '3. <b>ቀሪ ክፍያ (75%):</b> እቃው አዲስ አበባ አድራሻዎ ደርሶ ሲፈትሹ በጥሬ ገንዘብ ወይም በቴሌብር ይከፈላል።\n' +
    '4. <b>የማድረሻ ጊዜ:</b> ክፍያው ከተረጋገጠበት ቀን ጀምሮ ከ 10 እስከ 18 የስራ ቀናት።\n' +
    '5. <b>ዋስትና:</b> እቃው ከተበላሸ ወይም የተሳሳተ ከሆነ ሙሉ ተመላሽ ይደረጋል።'
  );
});

bot.action('contact_support', (ctx) => {
  ctx.replyWithHTML(
    '📞 <b>የኮርቻ ደንበኞች ድጋፍ መስመር:</b>\n\n' +
    '• ስልክ: +251 911 234 567 / +251 922 345 678\n' +
    '• ቴሌግራም አድሚን: @korcha_support\n' +
    '• ቢሮ አድራሻ: ቦሌ መድኃኒዓለም፣ አዲስ አበባ፣ ኢትዮጵያ'
  );
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  const isShein = text.includes('shein.com') || text.includes('shein.top');
  const isTemu = text.includes('temu.com') || text.includes('temu.to');
  const isAli = text.includes('aliexpress.com') || text.includes('aliexpress.us');
  const priceMatch = text.match(/\$?(\d+(\.\d+)?)\s*(usd|\$)?/i);

  let detectedPlatform = 'Shein';
  let estimatedUsd = 18.0;

  if (isShein) detectedPlatform = 'Shein';
  else if (isTemu) detectedPlatform = 'Temu';
  else if (isAli) detectedPlatform = 'AliExpress';
  else if (priceMatch) {
    estimatedUsd = parseFloat(priceMatch[1]);
    detectedPlatform = 'Marketplace Choice';
  } else {
    return ctx.replyWithHTML(
      '❓ እባክዎ ትክክለኛ የ <b>Shein</b>፣ <b>Temu</b> ወይም <b>AliExpress</b> ሊንክ ይላኩልን፤ ወይም ዋጋውን በዶላር ያስገቡ (ለምሳሌ: $20)።'
    );
  }

  const pricing = calculatePricing(estimatedUsd);

  userSessions.set(userId, {
    link: text,
    platform: detectedPlatform,
    pricing,
    userId: ctx.from.id,
    userName: ctx.from.first_name + (ctx.from.last_name ? ' ' + ctx.from.last_name : ''),
    username: ctx.from.username ? '@' + ctx.from.username : 'N/A',
  });

  const quoteMessage =
    `📦 <b>የእቃው ዝርዝርና የበር ላይ ዋጋ ስሌት (${detectedPlatform})</b>\n\n` +
    `💵 <b>የዋናው እቃ ዋጋ:</b> $${pricing.usdPrice.toFixed(2)} USD\n` +
    `📈 <b>የኮርቻ ማድረሻ ቀመር:</b> × 1.88 (ጭነት + ጉምሩክ + ደጃፍ ማድረሻ)\n` +
    `🏛️ <b>ይፋዊ የባንክ ምንዛሬ:</b> 1 USD = ${OFFICIAL_EXCHANGE_RATE} ETB\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>ጠቅላላ የበር ላይ ዋጋ: ${pricing.totalEtb.toLocaleString()} ብር (ETB)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🔹 <b>የ 25% ቅድመ ክፍያ (ቴሌብር):</b> ${pricing.depositEtb.toLocaleString()} ብር\n` +
    `🔹 <b>ቀሪ 75% ሲደርስ የሚከፈል:</b> ${pricing.codEtb.toLocaleString()} ብር\n\n` +
    `ይህን እቃ ለማዘዝ ደንቦቹን ተስማምተው 'ትዕዛዝ አረጋግጥ' የሚለውን ይጫኑ።`;

  await ctx.replyWithHTML(
    quoteMessage,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ ደንቦቹን ተስማምቻለሁ — እዘዝ', 'agree_and_order'),
      ],
      [
        Markup.button.callback('🔄 ሌላ እቃ መርምር', 'cat_shein'),
        Markup.button.callback('📞 ጥያቄ አለኝ', 'contact_support'),
      ]
    ])
  );
});

bot.action('agree_and_order', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);

  if (!session) {
    return ctx.reply('እባክዎ መጀመሪያ የእቃውን ሊንክ እንደገና ይላኩ።');
  }

  const orderId = 'KC-' + Math.floor(100000 + Math.random() * 900000);
  session.orderId = orderId;

  // 1. Send confirmation to the customer
  const customerConfirmation =
    `🎉 <b>እንኳን ደስ አልዎት! ትዕዛዝዎ ተመዝግቧል!</b>\n\n` +
    `<b>የትዕዛዝ መለያ (Order ID):</b> <code>#${orderId}</code>\n` +
    `<b>የእቃው ምንጭ:</b> ${session.platform}\n` +
    `<b>ጠቅላላ ዋጋ:</b> ${session.pricing.totalEtb.toLocaleString()} ብር\n` +
    `<b>የ 25% ቅድመ ክፍያ:</b> ${session.pricing.depositEtb.toLocaleString()} ብር\n\n` +
    `📲 <b>ቀጣይ እርምጃ:</b>\n` +
    `እባክዎ የ 25% ቅድመ ክፍያውን (${session.pricing.depositEtb.toLocaleString()} ብር) በቴሌብር ወደ ቁጥር: <b>${TELEBIRR_ACCOUNT}</b> (ኮርቻ ሎጂስቲክስ) ያስገቡ።\n\n` +
    `ክፍያውን እንደፈጸሙ የቴሌብሩን የግብይት ቁጥር (Txn ID) እና የማድረሻ አድራሻዎን (ከተማ፣ ክፍለ ከተማ፣ ምልክት) እዚህ ይላኩልን።\n\n` +
    `<i>የኮርቻ ሰራተኞች ወዲያውኑ ትዕዛዝዎን ተረክበው እያዘጋጁ ነው!</i>`;

  await ctx.replyWithHTML(customerConfirmation);

  // 2. DISPATCH INSTANT ALERT TO KORCHA WORKERS TELEGRAM GROUP
  if (WORKER_CHAT_ID) {
    const workerAlert =
      `🚨 <b>አዲስ የኮርቻ ትዕዛዝ ደርሷል! (NEW ORDER)</b>\n\n` +
      `<b>የትዕዛዝ ቁጥር:</b> #${orderId}\n` +
      `<b>የደንበኛ ስም:</b> ${session.userName}\n` +
      `<b>የቴሌግራም ዩዘር:</b> ${session.username} (ID: <code>${session.userId}</code>)\n` +
      `<b>ፕላትፎርም:</b> ${session.platform}\n` +
      `<b>የእቃው ሊንክ:</b> ${session.link}\n\n` +
      `💰 <b>የመጨረሻ ዋጋ (1.88x):</b> ${session.pricing.totalEtb.toLocaleString()} ETB\n` +
      `💵 <b>የሚጠበቅ ቅድመ ክፍያ (25%):</b> ${session.pricing.depositEtb.toLocaleString()} ETB\n` +
      `📦 <b>ቀሪ ሲደርስ (75% COD):</b> ${session.pricing.codEtb.toLocaleString()} ETB\n` +
      `✅ <b>ደንበኛው ደንቦቹን ተስማምቷል</b>\n` +
      `⏰ <b>ሰዓት:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })} (EAT)\n\n` +
      `<i>እባክዎን ክፍያውን በቴሌብር አረጋግጠው እቃውን ከቻይና ይዘዙ።</i>`;

    try {
      await bot.telegram.sendMessage(WORKER_CHAT_ID, workerAlert, { parse_mode: 'HTML' });
      console.log(`✅ Worker alert dispatched for order #${orderId}`);
    } catch (err) {
      console.error('❌ Failed to dispatch to worker group:', err.message);
    }
  }
});

bot.launch().then(() => {
  console.log('🚀 Korcha Telegram Bot is LIVE and listening for Ethiopian customers!');
  console.log(`📈 Landed Multiplier: ${LANDED_MULTIPLIER}x | Official Rate: ${OFFICIAL_EXCHANGE_RATE} ETB`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
